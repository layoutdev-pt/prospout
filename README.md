# Prospout — Commercial Operations Dashboard

A modern, real-time commercial operations dashboard built with Next.js 14, React 18, and Tailwind CSS. Track sales pipelines, calls, meetings, and deals for multiple business lines (Companies & Influencers).

## 🚀 Features

- **Real-time KPI Monitoring** - Live dashboards for sales metrics and conversions
- **Multi-Pipeline Support** - Separate tracking for Companies and Influencers
- **Activity Logging** - Track calls, DMs, emails, and meetings
- **Advanced Analytics** - Conversion rates, funnel analysis, and trend charts
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode UI** - Professional gradient-based dark theme with glassmorphic components
- **Sidebar Navigation** - Easy access to all pipelines and dashboards

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: Prisma + PostgreSQL (optional, uses in-memory storage by default)
- **Hosting**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🏃 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/layoutdev-pt/prospout.git
cd prospout
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` to add your database configuration (optional):
```env
# Database Configuration (Optional - uses in-memory storage if not configured)
DATABASE_URL=postgresql://user:password@localhost:5432/prospout

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build & Production

### Production Build

```bash
npm run build
npm run start
```

### Deploy to Vercel

This project is fully optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel settings (if using database)
4. Deploy!

**Important**: The app works with or without a database. By default, it uses in-memory storage that resets on server restart. For persistent data, configure a PostgreSQL database with Prisma.

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes (activities, analytics, reset)
│   ├── dashboard/        # Main dashboard page
│   ├── pipelines/        # Pipeline-specific pages
│   ├── layout.tsx        # Root layout with footer
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── KPIGrid.tsx       # Key performance indicators
│   ├── FunnelChart.tsx   # Sales funnel visualization
│   ├── ActivityLogger.tsx # Activity input form
│   └── ...
├── lib/
│   ├── memoryStore.ts    # In-memory data storage
│   ├── prisma.ts         # Prisma client (optional)
│   └── supabase.ts       # Supabase client (optional)
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## 🎯 Usage

### Dashboard
- View all pipeline statistics and KPIs
- Filter by date range and pipeline
- See real-time activity trends

### Pipeline Pages
- Companies: Track company outreach and deals
- Influencers: Track influencer partnerships

### Activity Logging
- Log calls, DMs, emails, and meetings
- Track conversion stages (R1, R2, R3)
- Record verbal agreements and closed deals

## 🔧 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run prisma:generate  # Generate Prisma client (requires DATABASE_URL)
npm run prisma:migrate   # Run Prisma migrations
npm run seed         # Seed database with sample data
```

## 📊 API Routes

- `GET /api/activities` - List activities with optional filters
- `POST /api/activities` - Create new activity
- `GET /api/analytics` - Get analytics and KPIs
- `POST /api/reset` - Reset all statistics

## 🎨 Customization

### Update Branding
- Edit `LAYOUT AGENCY` footer link in `app/layout.tsx`
- Customize colors in `tailwind.config.cjs` and `app/globals.css`

### Add Database
1. Set `DATABASE_URL` environment variable
2. Configure Prisma schema in `prisma/schema.prisma`
3. Run migrations: `npx prisma migrate deploy`

## 📝 License

Built by [Layout Agency](https://www.layoutagency.pt)

## 🤝 Support

For issues or questions, contact: layoutagency.pt@gmail.com

