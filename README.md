# 🔥 HotSpot Chat

Eine moderne Dating-App im Tinder-Style für lokale Venues - entwickelt mit **Next.js 14**, **TypeScript**, **Tailwind CSS** und **Supabase**.

## 📱 Über die App

HotSpot Chat verbindet Menschen in echten Locations miteinander. Nutzer können nur mit Personen matchen, die sich physisch im selben Venue befinden - für authentische, spontane Begegnungen.

### ✨ Key Features

- **🗺️ Live Location Tracking** - GPS-basiertes Geofencing 
- **💕 Tinder-Style Swiping** - Intuitive Swipe-Gesten mit Framer Motion
- **⚡ Instant Matches** - Echte Verbindungen in Echtzeit
- **💬 Live Chat** - Realtime Messaging mit Supabase
- **📱 Mobile-First Design** - Optimiert für Smartphones
- **🔒 Sicher & Privat** - SMS-Verifizierung und Datenschutz

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Location**: HTML5 Geolocation API, PostGIS
- **Deployment**: Vercel (oder ähnlich)

## 📋 Features Status

### ✅ **Implementiert**
- [x] Projekt-Setup mit Next.js 14 + TypeScript
- [x] Responsive Design mit Tailwind CSS
- [x] Supabase Integration & Database Schema
- [x] GPS Location Tracking & Geofencing
- [x] SMS Authentication (Login/Verify Pages)
- [x] Swipe Cards mit Framer Motion Animationen
- [x] UI Component Library (Button, Card, Input)
- [x] TypeScript Type Definitions
- [x] Utility Functions & Hooks

### 🚧 **In Entwicklung**
- [ ] Registration Flow komplettieren
- [ ] Dashboard für Users
- [ ] Match Management System
- [ ] Realtime Chat Implementation
- [ ] Push Notifications
- [ ] Venue Owner Dashboard
- [ ] Analytics & Reporting

### 🔜 **Geplant**
- [ ] Photo Upload & Management
- [ ] Reward System
- [ ] Payment Integration (Stripe)
- [ ] Mobile App (React Native)
- [ ] Advanced Matching Algorithm

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Supabase Account

### 1. Repository klonen
```bash
git clone <repository-url>
cd HotSpotChat
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
```bash
cp .env.example .env.local
```

Fülle die `.env.local` mit deinen Supabase Credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Supabase Database Setup
1. Erstelle ein neues Supabase Projekt
2. Führe das SQL Schema aus: `supabase/schema.sql`
3. Aktiviere Row Level Security (RLS)
4. Konfiguriere Auth Settings

### 5. Development Server starten
```bash
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
HotSpotChat/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth Pages (Login, Register, Verify)
│   ├── (main)/             # Main App Pages (Discover, Dashboard, Chat)
│   ├── (venue)/            # Venue Owner Pages
│   ├── api/                # API Routes
│   ├── globals.css         # Global Styles
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Landing Page
├── components/             # React Components
│   ├── ui/                 # Basic UI Components
│   ├── swipe/              # Swipe-related Components
│   └── chat/               # Chat Components
├── lib/                    # Utilities & Logic
│   ├── supabase/           # Supabase Client & Helpers
│   ├── utils/              # Utility Functions
│   └── hooks/              # Custom React Hooks
├── types/                  # TypeScript Definitions
├── supabase/               # Database Schema
└── public/                 # Static Assets
```

## 🗄️ Database Schema

Die App nutzt PostgreSQL (via Supabase) mit folgenden Haupttabellen:

- **users** - Benutzerprofile und -daten
- **venues** - Locations mit GPS-Koordinaten  
- **matches** - User-zu-User Matches
- **messages** - Chat-Nachrichten
- **likes** - Swipe-Aktionen (Like/Pass)
- **check_ins** - Venue Check-in Historie
- **rewards** - Belohnungssystem

Siehe `supabase/schema.sql` für Details.

## 📱 Core Functionality

### Location Tracking
```typescript
// GPS-basiertes Geofencing
const { location, currentVenues, isInVenue } = useLocation({
  watch: true,
  onVenueEnter: (venueId, venueName) => {
    console.log(`Entered: ${venueName}`);
  }
});
```

### Swipe Mechanismus
```typescript
// Tinder-style Swipe Cards
<SwipeCard
  user={user}
  onSwipe={(direction, user) => {
    if (direction === 'right') {
      // Like logic
      checkForMatch(user.id);
    }
  }}
/>
```

### Realtime Features
```typescript
// Live Match-Updates via Supabase
supabaseHelpers.subscribeToMatches(userId, (payload) => {
  showMatchNotification(payload.new);
});
```

## 🎨 Design System

Das UI basiert auf einem konsistenten Design System:

- **Farben**: Primary (Pink) + Secondary (Grau) Palette
- **Typography**: Inter Font Family
- **Components**: Wiederverwendbare UI-Bausteine
- **Animations**: Framer Motion für smooth Übergänge
- **Mobile-First**: Responsive Design

## 🔧 Development

### Scripts
```bash
npm run dev          # Development Server
npm run build        # Production Build  
npm run start        # Production Server
npm run lint         # ESLint Check
npm run type-check   # TypeScript Check
```

### Code Style
- **TypeScript** für Type Safety
- **ESLint** für Code Quality
- **Prettier** für Formatting (empfohlen)
- Funktionale Komponenten mit Hooks

## 🚀 Deployment

### Vercel (empfohlen)
1. Verbinde GitHub Repository mit Vercel
2. Konfiguriere Environment Variables
3. Deploy automatisch bei Git Push

### Andere Plattformen
- Netlify
- Railway
- DigitalOcean App Platform

## 🔒 Sicherheit

- **SMS Verification** für Phone Auth
- **Row Level Security** (RLS) in Supabase
- **Input Validation** auf Client + Server
- **Rate Limiting** für API Calls
- **Secure Headers** via Next.js

## 📈 Performance

- **Next.js App Router** für optimales Routing
- **Image Optimization** built-in
- **Code Splitting** automatisch
- **Caching** für API Responses
- **Lazy Loading** für Components

## 🤝 Contributing

1. Fork das Repository
2. Erstelle Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit Changes (`git commit -m 'Add amazing feature'`)
4. Push Branch (`git push origin feature/amazing-feature`)
5. Öffne Pull Request

## 📄 License

Dieses Projekt steht unter der MIT License. Siehe `LICENSE` Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- 📧 Email: info@hotspotchat.app
- 💬 GitHub Issues
- 📱 App Store Reviews

## 🎯 Roadmap

### Q1 2024
- [ ] MVP Launch mit Basic Features
- [ ] iOS/Android App (React Native)
- [ ] Integration mit ersten Venues

### Q2 2024  
- [ ] Advanced Matching Algorithm
- [ ] Push Notifications
- [ ] Venue Analytics Dashboard

### Q3 2024
- [ ] Premium Features
- [ ] Payment Integration
- [ ] Social Media Integration

---

**Made with ❤️ in Germany** 

*Für Feedback und Verbesserungsvorschläge sind wir immer offen!*