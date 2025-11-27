# Google Cloud & AI Setup Guide

This guide explains how to set up Google Firestore (cloud database) and Google AI integration with Prospout.

## Prerequisites

- Google Cloud Account
- Firebase Project created
- Google AI API credentials

## 📋 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. Enter project name: `prospout`
4. Enable Google Analytics (optional)
5. Click **Create project**

## 🔥 Step 2: Setup Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose region (e.g., `europe-west1`)
5. Click **Create**

### Security Rules

Add these security rules in Firestore (Security Rules tab):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /activities/{document=**} {
      allow read, write: if true;
    }
    match /deals/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🔑 Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Web** if not already added
4. Copy the config object:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## 🤖 Step 4: Setup Google AI (Gemini)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy your API key

## 🔐 Step 5: Add Environment Variables

Create `.env.local` in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI (Gemini)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 🚀 Step 6: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your Prospout project
3. Go to **Settings** → **Environment Variables**
4. Add all the variables from Step 5
5. Redeploy

## ✨ Features Enabled

### With Firestore:
- ✅ Persistent data storage in the cloud
- ✅ Real-time synchronization
- ✅ Automatic backups
- ✅ Cross-device access
- ✅ Scales automatically

### With Google AI:
- ✅ Call transcription analysis
- ✅ Automatic sentiment detection
- ✅ Objection detection
- ✅ Call quality scoring
- ✅ Activity insights generation
- ✅ Deal summary generation

## 📝 Usage Examples

### Analyze Call Transcript

```typescript
import { analyzeCallTranscript } from '@/lib/googleAI';

const analysis = await analyzeCallTranscript(`
  Sales: Hi, interested in our service?
  Client: Tell me about pricing...
`);

console.log(analysis.sentiment); // 'neutral'
console.log(analysis.score); // 75
```

### Get Activities from Firestore

```typescript
import { getActivities } from '@/lib/firestoreService';

const activities = await getActivities({
  pipeline: 'COMPANIES',
  from: '2024-01-01',
  to: '2024-01-31'
});
```

## 🔍 Firestore Data Structure

### Activities Collection
```
/activities/{id}
  - userId: string
  - date: string
  - pipeline: 'COMPANIES' | 'INFLUENCERS'
  - coldCallsMade: number
  - coldCallsAnswered: number
  - r1Completed: number
  - dealsClosed: number
  - ... (other metrics)
  - createdAt: string
```

### Deals Collection
```
/deals/{id}
  - userId: string
  - pipeline: 'COMPANIES' | 'INFLUENCERS'
  - companyName: string
  - value: number
  - verbalAgreement: boolean
  - createdAt: string
  - closedAt: string (optional)
```

## 💡 Tips

- **Cost**: Firestore offers free tier (1GB storage, 50k reads/day)
- **Real-time**: Enable real-time listeners with `.onSnapshot()` for live updates
- **Backup**: Firestore automatically backs up your data
- **AI**: Google AI offers free tier (60 requests/minute)

## 🆘 Troubleshooting

### "Firestore not initialized"
- Check all Firebase environment variables are set
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is correct

### "Google AI API key not configured"
- Add `NEXT_PUBLIC_GOOGLE_AI_API_KEY` to environment
- Verify API key is from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Data not persisting
- Check Firestore security rules allow writes
- Verify collection names match (`activities`, `deals`)

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Google AI Documentation](https://ai.google.dev/)
- [Next.js & Firebase](https://nextjs.org/learn/firestore)

---

Built by [Layout Agency](https://www.layoutagency.pt)
