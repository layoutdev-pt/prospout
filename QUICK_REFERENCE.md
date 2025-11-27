# 🚀 Prospout Google Cloud Setup - Quick Reference

## What's Included

✅ **Google Firestore** - Cloud database for persistent data storage
✅ **Google AI (Gemini)** - AI-powered call analysis & insights
✅ **Firebase SDK** - Real-time synchronization
✅ **TypeScript Support** - Fully typed Firebase operations

## 📊 What Data Stores Where

### Firestore Collections

**activities** - All call, email, DM, and meeting logs
```json
{
  "userId": "user-123",
  "date": "2024-01-15",
  "pipeline": "COMPANIES",
  "coldCallsMade": 50,
  "coldCallsAnswered": 10,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**deals** - Company/influencer deal tracking
```json
{
  "userId": "user-123",
  "pipeline": "COMPANIES",
  "companyName": "Acme Corp",
  "value": 50000,
  "verbalAgreement": true,
  "createdAt": "2024-01-01T08:00:00Z",
  "closedAt": "2024-01-15T16:00:00Z"
}
```

## 🤖 AI Features Available

### 1. Analyze Call Transcripts
```typescript
import { analyzeCallTranscript } from '@/lib/googleAI';

const result = await analyzeCallTranscript(transcript);
// Returns: {
//   summary: "Client interested in pricing...",
//   sentiment: "positive" | "neutral" | "negative",
//   objections: ["price", "timeline"],
//   score: 85
// }
```

### 2. Generate Activity Insights
```typescript
import { generateActivityInsights } from '@/lib/googleAI';

const insights = await generateActivityInsights({
  callsMade: 100,
  callsAnswered: 25,
  r1Meetings: 10,
  dealsClose: 2
});
// Returns actionable improvement suggestions
```

### 3. Generate Deal Summaries
```typescript
import { generateDealSummary } from '@/lib/googleAI';

const summary = await generateDealSummary({
  companyName: "Acme Corp",
  industry: "Technology",
  value: 50000,
  stage: "Verbal Agreement",
  notes: "Follow up after CEO meeting"
});
```

## 🔄 Data Operations

### Get Activities
```typescript
import { getActivities } from '@/lib/firestoreService';

const activities = await getActivities({
  pipeline: 'COMPANIES',
  from: '2024-01-01',
  to: '2024-01-31'
});
```

### Add Activity
```typescript
import { addActivity } from '@/lib/firestoreService';

await addActivity({
  userId: 'user-123',
  date: '2024-01-15',
  pipeline: 'COMPANIES',
  coldCallsMade: 50,
  coldCallsAnswered: 10,
  // ... other fields
});
```

### Update Deal
```typescript
import { updateDeal } from '@/lib/firestoreService';

await updateDeal(dealId, {
  verbalAgreement: true,
  closedAt: new Date().toISOString()
});
```

## 🌐 Deployment Steps

1. **Create Firebase Project**: [firebase.google.com](https://firebase.google.com)
2. **Get Credentials**: From Firebase Console → Project Settings
3. **Create Google AI API Key**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
4. **Add to Vercel**: Settings → Environment Variables
5. **Redeploy**: Your app will now use cloud storage

## 💰 Costs

- **Firestore**: Free tier includes 1GB storage, 50k reads/day
- **Google AI**: Free tier includes 60 requests/minute
- **Firebase**: Free hosting with 5GB CDN

## 📝 Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_AI_API_KEY=
```

See `GOOGLE_CLOUD_SETUP.md` for complete setup instructions.

---

Questions? Check [layoutagency.pt](https://www.layoutagency.pt)
