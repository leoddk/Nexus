# NEXUS Globe - Military Hub Monitoring System

A React-based 3D globe application for monitoring military hub status across the globe. Built with TypeScript, Supabase, and React Globe GL.

## Features

- 🌍 Interactive 3D globe with military hub locations
- 🔐 Secure authentication with role-based access (Admin/Viewer)
- ⚡ Real-time status updates with live synchronization
- 🎯 Point selection and detailed information panels
- 📊 Status monitoring with operational statistics
- 🔍 Search and filter capabilities
- 🎨 Military-themed UI with Air Force styling

## Quick Start

### 1. Database Setup (Supabase)

Run the following SQL in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database/schema.sql
-- Then copy and paste the contents of database/seed-data.sql
```

### 2. Environment Configuration

Your `.env` file is already configured with your Supabase credentials.

### 3. Install & Run

```bash
npm install
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth.tsx        # Authentication form
│   ├── Globe.tsx       # 3D globe visualization  
│   └── ControlPanel.tsx # Point management panel
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state
│   └── usePoints.ts    # Points data management
├── services/           # API service layer
│   ├── authService.ts  # Authentication operations
│   └── pointsService.ts # Points CRUD operations
├── types/              # TypeScript definitions
├── lib/                # External library configs
└── App.tsx            # Main application component
```

## Database Schema

### Tables
- `profiles` - User profiles with role management
- `nexus_points` - Military hub locations and status

### Security
- Row Level Security (RLS) enabled
- Role-based permissions (admin/viewer)
- Authenticated user access only

## Military Hub Data

The application comes pre-seeded with 40+ strategic military locations including:

- **US Air Force Bases**: Pentagon, Wright-Patterson, Ramstein, etc.
- **Naval Facilities**: Norfolk, Pearl Harbor, Yokosuka, etc.
- **Strategic Commands**: NORAD, CENTCOM, Space Force bases
- **Early Warning Systems**: Thule, Fylingdales, Clear AFS
- **International Bases**: NATO facilities, joint operations centers

## User Roles

### Admin Users
- Add, edit, and delete military hub points
- Update status of existing points
- Full CRUD operations

### Viewer Users  
- View all military hub locations
- Search and filter points
- Real-time status monitoring
- Read-only access

## Status Indicators

- 🟢 **Green**: Operational/Online
- 🟡 **Yellow**: Warning/Degraded
- 🔴 **Red**: Offline/Critical

## Development

### Key Technologies
- **React 18** with TypeScript
- **Supabase** for backend and real-time updates
- **React Globe GL** for 3D globe visualization
- **Tailwind CSS** for styling
- **PostgreSQL** with Row Level Security

### Available Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Security Notes

This application is designed for defensive security monitoring purposes only. All military hub locations included are based on publicly available information and are intended for educational and monitoring use cases.