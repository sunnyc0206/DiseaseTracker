# World Disease Tracker (WDT)

A modern, frontend-only web application for tracking global disease outbreaks and health emergencies worldwide.

## Features

- 🌍 **Interactive World Map** - Click on countries to see disease statistics
- 📊 **Disease Database** - Comprehensive information about various diseases
- 📰 **Health News** - Latest updates from health organizations
- 📈 **Real-time Statistics** - Track disease cases, deaths, and recoveries
- 🔍 **Advanced Filtering** - Filter by country, disease type, and severity
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Local Storage** - Admin can add custom diseases stored locally
- 🎨 **Beautiful Animations** - Smooth transitions powered by Framer Motion

## Technologies

- **React 18** - Modern React with hooks
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **React Simple Maps** - Interactive world map
- **Local Storage** - For data persistence

## Getting Started

### Prerequisites

- Node.js 18+ (or Node.js 19 as you're using)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd world-disease-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Public Features

- Browse disease information
- View global statistics on the interactive map
- Read latest health news
- Filter and search diseases

### Admin Features

1. Login at `/admin/login` with:
   - Email: `admin@worlddiseasetracker.com`
   - Password: `admin123`

2. Admin can:
   - Add new diseases
   - Edit existing disease information
   - Update statistics
   - Manage disease data locally

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory. You can deploy these to any static hosting service like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

## Deployment

### Netlify (Recommended)

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to [Netlify](https://app.netlify.com/drop)

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/world-disease-tracker",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

## Data Sources

Currently, the app uses mock data for demonstration. In a real-world scenario, you could:
- Integrate with WHO API
- Use CDC data feeds
- Connect to health organization RSS feeds
- Implement a CORS proxy for external APIs

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
