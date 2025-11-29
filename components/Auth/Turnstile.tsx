"use client";
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { turnstile: any }
}

export default function Turnstile({ onToken }: { onToken: (token: string|null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement|null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!siteKey || !window.turnstile || !containerRef.current || rendered) return;
    try {
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(null),
        'expired-callback': () => onToken(null),
      });
      setRendered(true);
    } catch (e) {
      console.error('Turnstile render failed', e);
    }
  }, [siteKey, onToken, rendered]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div ref={containerRef} />
    </>
  );
}

