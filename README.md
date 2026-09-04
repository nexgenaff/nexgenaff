# NextGen Affiliates Pro

🚀 Premium Affiliate Tracking Platform with Custom Domains & CORS Support

## Features

- 🌍 Geo-based smart redirects with REAL IP2Location
- 📊 Advanced analytics with live charts
- 🔗 Custom domains with REAL DNS verification
- 🤖 AI bot detection
- 📈 Public dashboards
- 🎨 Premium dark theme UI
- 🔒 Enterprise-grade security
- 🌐 CORS & Referrer Policy support

## Quick Start

```bash
# Clone repository
git clone https://github.com/https://github.com/nexgenaff/nexgenaff.git
cd nextgen-affiliates-pro

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Run development
npm run dev