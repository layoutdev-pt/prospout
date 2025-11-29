-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Create enum pipeline_type if not exists (safe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_type') THEN
    CREATE TYPE public.pipeline_type AS ENUM ('COMPANIES', 'INFLUENCERS');
  END IF;
END
$$;

-- 2) Activity log table (one row per user + pipeline + date)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  pipeline public.pipeline_type NOT NULL,
  activity_date date NOT NULL,

  -- Cold outreach metrics
  cold_calls_made integer NOT NULL DEFAULT 0,
  cold_calls_answered integer NOT NULL DEFAULT 0,
  r1_via_call integer NOT NULL DEFAULT 0,
  cold_dms_sent integer NOT NULL DEFAULT 0,
  cold_dms_replied integer NOT NULL DEFAULT 0,
  r1_via_dm integer NOT NULL DEFAULT 0,
  emails_sent integer NOT NULL DEFAULT 0,
  emails_opened integer NOT NULL DEFAULT 0,
  emails_replied integer NOT NULL DEFAULT 0,
  r1_via_email integer NOT NULL DEFAULT 0,

  -- Meeting pipeline metrics
  r1_completed integer NOT NULL DEFAULT 0,
  r2_scheduled integer NOT NULL DEFAULT 0,
  r2_completed integer NOT NULL DEFAULT 0,
  r3_scheduled integer NOT NULL DEFAULT 0,
  r3_completed integer NOT NULL DEFAULT 0,

  -- Closing metrics
  verbal_agreements integer NOT NULL DEFAULT 0,
  deals_closed integer NOT NULL DEFAULT 0,
  avg_time_to_cash_days numeric(8,2),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT activity_log_unique_day UNIQUE (user_id, pipeline, activity_date)
);

-- Indexes to support filtering by user/pipeline/date (calendar & trends)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_pipeline_date ON public.activity_log(pipeline, activity_date);

-- Trigger to update updated_at on UPDATE
CREATE OR REPLACE FUNCTION public.touch_activity_log_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_log_updated_at ON public.activity_log;
CREATE TRIGGER trg_activity_log_updated_at
BEFORE UPDATE ON public.activity_log
FOR EACH ROW EXECUTE FUNCTION public.touch_activity_log_updated_at();

-- 3) Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  website text,
  industry text,
  company_size text,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_user ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON public.companies USING gin (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.touch_companies_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.touch_companies_updated_at();

-- 4) Influencers table
CREATE TABLE IF NOT EXISTS public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  instagram_handle text,
  followers integer DEFAULT 0,
  email text,
  niche text,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_influencers_user ON public.influencers(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_handle_trgm ON public.influencers USING gin (instagram_handle gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.touch_influencers_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_influencers_updated_at ON public.influencers;
CREATE TRIGGER trg_influencers_updated_at
BEFORE UPDATE ON public.influencers
FOR EACH ROW EXECUTE FUNCTION public.touch_influencers_updated_at();

-- 5) Upsert helper for logging/editing a day's metrics
CREATE OR REPLACE FUNCTION public.upsert_activity_log(
  p_user_id uuid,
  p_pipeline public.pipeline_type,
  p_activity_date date,
  p_payload jsonb
) RETURNS public.activity_log
LANGUAGE plpgsql
AS $$
DECLARE
  target_id uuid;
BEGIN
  INSERT INTO public.activity_log (
    user_id, pipeline, activity_date,
    cold_calls_made,
    cold_calls_answered,
    r1_via_call,
    cold_dms_sent,
    cold_dms_replied,
    r1_via_dm,
    emails_sent,
    emails_opened,
    emails_replied,
    r1_via_email,
    r1_completed,
    r2_scheduled,
    r2_completed,
    r3_scheduled,
    r3_completed,
    verbal_agreements,
    deals_closed,
    avg_time_to_cash_days
  ) VALUES (
    p_user_id,
    p_pipeline,
    p_activity_date,
    COALESCE((p_payload->>'cold_calls_made')::int, 0),
    COALESCE((p_payload->>'cold_calls_answered')::int, 0),
    COALESCE((p_payload->>'r1_via_call')::int, 0),
    COALESCE((p_payload->>'cold_dms_sent')::int, 0),
    COALESCE((p_payload->>'cold_dms_replied')::int, 0),
    COALESCE((p_payload->>'r1_via_dm')::int, 0),
    COALESCE((p_payload->>'emails_sent')::int, 0),
    COALESCE((p_payload->>'emails_opened')::int, 0),
    COALESCE((p_payload->>'emails_replied')::int, 0),
    COALESCE((p_payload->>'r1_via_email')::int, 0),
    COALESCE((p_payload->>'r1_completed')::int, 0),
    COALESCE((p_payload->>'r2_scheduled')::int, 0),
    COALESCE((p_payload->>'r2_completed')::int, 0),
    COALESCE((p_payload->>'r3_scheduled')::int, 0),
    COALESCE((p_payload->>'r3_completed')::int, 0),
    COALESCE((p_payload->>'verbal_agreements')::int, 0),
    COALESCE((p_payload->>'deals_closed')::int, 0),
    NULLIF((p_payload->>'avg_time_to_cash_days'), '')::numeric
  )
  ON CONFLICT (user_id, pipeline, activity_date)
  DO UPDATE SET
    cold_calls_made = EXCLUDED.cold_calls_made,
    cold_calls_answered = EXCLUDED.cold_calls_answered,
    r1_via_call = EXCLUDED.r1_via_call,
    cold_dms_sent = EXCLUDED.cold_dms_sent,
    cold_dms_replied = EXCLUDED.cold_dms_replied,
    r1_via_dm = EXCLUDED.r1_via_dm,
    emails_sent = EXCLUDED.emails_sent,
    emails_opened = EXCLUDED.emails_opened,
    emails_replied = EXCLUDED.emails_replied,
    r1_via_email = EXCLUDED.r1_via_email,
    r1_completed = EXCLUDED.r1_completed,
    r2_scheduled = EXCLUDED.r2_scheduled,
    r2_completed = EXCLUDED.r2_completed,
    r3_scheduled = EXCLUDED.r3_scheduled,
    r3_completed = EXCLUDED.r3_completed,
    verbal_agreements = EXCLUDED.verbal_agreements,
    deals_closed = EXCLUDED.deals_closed,
    avg_time_to_cash_days = EXCLUDED.avg_time_to_cash_days,
    updated_at = now()
  RETURNING id INTO target_id;

  RETURN (SELECT * FROM public.activity_log WHERE id = target_id);
END;
$$;

-- 6) Analytics function returning JSON with totals + KPIs
CREATE OR REPLACE FUNCTION public.get_activity_analytics(
  p_user_id uuid,
  p_pipeline public.pipeline_type DEFAULT NULL,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  data RECORD;
  result jsonb;
  total_r1_sources integer;
BEGIN
  SELECT
    COALESCE(SUM(cold_calls_made), 0) AS total_calls,
    COALESCE(SUM(cold_calls_answered), 0) AS cold_calls_answered,
    COALESCE(SUM(r1_via_call), 0) AS r1_via_call,
    COALESCE(SUM(cold_dms_sent), 0) AS cold_dms_sent,
    COALESCE(SUM(cold_dms_replied), 0) AS cold_dms_replied,
    COALESCE(SUM(r1_via_dm), 0) AS r1_via_dm,
    COALESCE(SUM(emails_sent), 0) AS emails_sent,
    COALESCE(SUM(emails_opened), 0) AS emails_opened,
    COALESCE(SUM(emails_replied), 0) AS emails_replied,
    COALESCE(SUM(r1_via_email), 0) AS r1_via_email,
    COALESCE(SUM(r1_completed), 0) AS r1_completed,
    COALESCE(SUM(r2_scheduled), 0) AS r2_scheduled,
    COALESCE(SUM(r2_completed), 0) AS r2_completed,
    COALESCE(SUM(r3_scheduled), 0) AS r3_scheduled,
    COALESCE(SUM(r3_completed), 0) AS r3_completed,
    COALESCE(SUM(verbal_agreements), 0) AS verbal_agreements,
    COALESCE(SUM(deals_closed), 0) AS deals_closed,
    AVG(avg_time_to_cash_days) FILTER (WHERE avg_time_to_cash_days IS NOT NULL) AS avg_time_to_cash
  INTO data
  FROM public.activity_log
  WHERE user_id = p_user_id
    AND (p_pipeline IS NULL OR pipeline = p_pipeline)
    AND (p_from IS NULL OR activity_date >= p_from)
    AND (p_to IS NULL OR activity_date <= p_to);

  total_r1_sources := COALESCE(data.r1_via_call,0) + COALESCE(data.r1_via_dm,0) + COALESCE(data.r1_via_email,0);

  result := jsonb_build_object(
    'totals', jsonb_build_object(
      'total_calls', data.total_calls,
      'cold_calls_answered', data.cold_calls_answered,
      'r1_via_call', data.r1_via_call,
      'cold_dms_sent', data.cold_dms_sent,
      'cold_dms_replied', data.cold_dms_replied,
      'r1_via_dm', data.r1_via_dm,
      'emails_sent', data.emails_sent,
      'emails_opened', data.emails_opened,
      'emails_replied', data.emails_replied,
      'r1_via_email', data.r1_via_email,
      'r1_completed', data.r1_completed,
      'r2_scheduled', data.r2_scheduled,
      'r2_completed', data.r2_completed,
      'r3_scheduled', data.r3_scheduled,
      'r3_completed', data.r3_completed,
      'verbal_agreements', data.verbal_agreements,
      'deals_closed', data.deals_closed,
      'avg_time_to_cash_days', data.avg_time_to_cash
    ),
    'pct_calls_answered', CASE WHEN data.total_calls = 0 THEN 0 ELSE round((data.cold_calls_answered::numeric / data.total_calls) * 100, 1) END,
    'pct_r1_via_call', CASE WHEN data.total_calls = 0 THEN 0 ELSE round((data.r1_via_call::numeric / data.total_calls) * 100, 1) END,
    'pct_dm_response', CASE WHEN data.cold_dms_sent = 0 THEN 0 ELSE round((data.cold_dms_replied::numeric / data.cold_dms_sent) * 100, 1) END,
    'pct_r1_via_dm', CASE WHEN data.cold_dms_replied = 0 THEN 0 ELSE round((data.r1_via_dm::numeric / data.cold_dms_replied) * 100, 1) END,
    'pct_email_open', CASE WHEN data.emails_sent = 0 THEN 0 ELSE round((data.emails_opened::numeric / data.emails_sent) * 100, 1) END,
    'pct_email_reply', CASE WHEN data.emails_sent = 0 THEN 0 ELSE round((data.emails_replied::numeric / data.emails_sent) * 100, 1) END,
    'pct_r1_show', CASE WHEN total_r1_sources = 0 THEN 0 ELSE round((data.r1_completed::numeric / NULLIF(total_r1_sources,0)) * 100, 1) END,
    'pct_r2_show', CASE WHEN data.r2_scheduled = 0 THEN 0 ELSE round((data.r2_completed::numeric / NULLIF(data.r2_scheduled,0)) * 100, 1) END,
    'pct_r3_show', CASE WHEN data.r3_scheduled = 0 THEN 0 ELSE round((data.r3_completed::numeric / NULLIF(data.r3_scheduled,0)) * 100, 1) END,
    'pct_r1_to_close', CASE WHEN data.r1_completed = 0 THEN 0 ELSE round((data.deals_closed::numeric / NULLIF(data.r1_completed,0)) * 100, 1) END,
    'pct_r2_to_close', CASE WHEN data.r2_completed = 0 THEN 0 ELSE round((data.deals_closed::numeric / NULLIF(data.r2_completed,0)) * 100, 1) END,
    'pct_r3_to_close', CASE WHEN data.r3_completed = 0 THEN 0 ELSE round((data.deals_closed::numeric / NULLIF(data.r3_completed,0)) * 100, 1) END,
    'pct_r1_to_verbal', CASE WHEN data.r1_completed = 0 THEN 0 ELSE round((data.verbal_agreements::numeric / NULLIF(data.r1_completed,0)) * 100, 1) END,
    'pct_r2_to_verbal', CASE WHEN data.r2_completed = 0 THEN 0 ELSE round((data.verbal_agreements::numeric / NULLIF(data.r2_completed,0)) * 100, 1) END,
    'pct_r3_to_verbal', CASE WHEN data.r3_completed = 0 THEN 0 ELSE round((data.verbal_agreements::numeric / NULLIF(data.r3_completed,0)) * 100, 1) END,
    'pct_r1_to_r2', CASE WHEN data.r1_completed = 0 THEN 0 ELSE round((data.r2_scheduled::numeric / NULLIF(data.r1_completed,0)) * 100, 1) END,
    'pct_r2_to_r3', CASE WHEN data.r2_completed = 0 THEN 0 ELSE round((data.r3_scheduled::numeric / NULLIF(data.r2_completed,0)) * 100, 1) END
  );

  RETURN result;
END;
$$;

-- 7) Time-series helper for charts/heatmaps
CREATE OR REPLACE FUNCTION public.get_activity_timeseries(
  p_user_id uuid,
  p_pipeline public.pipeline_type DEFAULT NULL,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_granularity text DEFAULT 'day' -- 'day', 'week', 'month', 'year'
) RETURNS TABLE (
  period_start date,
  pipeline public.pipeline_type,
  total_calls bigint,
  r1_completed bigint,
  r2_scheduled bigint,
  r2_completed bigint,
  r3_scheduled bigint,
  r3_completed bigint,
  deals_closed bigint
) LANGUAGE sql AS $$
  SELECT
    CASE
      WHEN p_granularity = 'week' THEN date_trunc('week', activity_date)::date
      WHEN p_granularity = 'month' THEN date_trunc('month', activity_date)::date
      WHEN p_granularity = 'year' THEN date_trunc('year', activity_date)::date
      ELSE activity_date
    END AS period_start,
    pipeline,
    SUM(cold_calls_made) as total_calls,
    SUM(r1_completed) as r1_completed,
    SUM(r2_scheduled) as r2_scheduled,
    SUM(r2_completed) as r2_completed,
    SUM(r3_scheduled) as r3_scheduled,
    SUM(r3_completed) as r3_completed,
    SUM(deals_closed) as deals_closed
  FROM public.activity_log
  WHERE user_id = p_user_id
    AND (p_pipeline IS NULL OR pipeline = p_pipeline)
    AND (p_from IS NULL OR activity_date >= p_from)
    AND (p_to IS NULL OR activity_date <= p_to)
  GROUP BY period_start, pipeline
  ORDER BY period_start;
$$;

-- Notes: enable Row Level Security and policies as needed before exposing to clients.

