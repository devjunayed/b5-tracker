# Batch 5 Module Tracker

A modern, single-page web application for tracking learning progress across modules and missions in the Batch 5 Full Stack Web Development program.

## ✨ Features

- **Single-Page Layout**: Stats displayed at the top, functionality below
- **Overall Progress Tracking**: Visual progress bar and percentage completion
- **Mission Management**: Create, organize, and manage learning missions
- **Module Tracking**: Add modules to missions and mark them as complete
- **Quick Stats Dashboard**: Visual cards showing completion metrics
- **Real-time Updates**: Instant feedback on progress changes
- **Dark Theme**: Eye-friendly dark UI optimized for long study sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 (RC) with TypeScript
- **Framework**: Next.js 15 (Latest)
- **Database**: PostgreSQL with Prisma ORM
- **Backend**: Next.js API Routes
- **Styling**: CSS3 with CSS Variables

### Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main single-page component
│   ├── globals.css         # Global styles with responsive design
│   └── api/
│       ├── missions/       # Mission endpoints
│       └── modules/        # Module endpoints
├── components/
│   ├── MissionCard.tsx     # Mission card with expansion
│   ├── ModuleItem.tsx      # Individual module item
│   ├── ProgressBar.tsx     # Progress visualization
│   └── AddForm.tsx         # Reusable form component
├── hooks/
│   └── useTracker.ts       # Main state management hook
├── types/
│   └── index.ts            # TypeScript definitions
└── lib/
    ├── prisma.ts           # Prisma client instance
    └── supabase.ts         # Supabase client config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm or yarn
- PostgreSQL database (or use Supabase)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd batch5-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. Set up the database
```bash
npx prisma db push
npx prisma db seed
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Page Layout

### Top Section - Stats Dashboard
- Overall progress bar with percentage
- Quick stat cards (Complete %, Done count, In Progress count, Mission count)
- Sticky positioning for easy reference while scrolling

### Bottom Section - Functionality
- Missions list with expansion/collapse
- Module items with checkboxes
- Add mission button
- Add module buttons per mission

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 📝 Database Schema

### Mission
- `id`: Unique identifier
- `title`: Mission name
- `modules`: Related modules
- `createdAt`: Creation timestamp

### Module
- `id`: Unique identifier
- `name`: Module name
- `done`: Completion status
- `missionId`: Parent mission reference
- `createdAt`: Creation timestamp

## 🎨 Customization

### Colors
Edit CSS variables in `src/app/globals.css`:
```css
:root {
  --accent: #22c57e;        /* Primary color */
  --danger: #e05555;        /* Error/delete color */
  --bg: #0f1117;            /* Background */
  /* ... more variables */
}
```

### Statistics
The stats section is fully customizable. Modify the stat cards in `src/app/page.tsx` under the `stats-grid` section.

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/batch5-tracker

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall rules

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: All modern versions

## 📄 License

MIT License - Feel free to use this project for your Batch 5 journey!

## 🎯 Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Module notes/descriptions
- [ ] Deadline tracking
- [ ] Progress history/analytics
- [ ] Export progress reports
- [ ] Collaborative features

---

**Version**: 2.0.0  
**Last Updated**: May 2025  
**Dependencies Updated**: Latest stable versions
# b5-tracker
# b5-tracker
