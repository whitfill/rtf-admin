# Round Top Finder - Admin Dashboard

A password-protected admin dashboard for monitoring the Round Top Finder platform.

## What This Does

- Displays real-time system health and service status
- Shows vendor/product statistics and search index info
- Provides quick actions (warm up models, test AI, check payments)
- Links to all external service dashboards
- **Password protected** - only accessible with correct credentials

## Tech Stack

- Static HTML/CSS/JavaScript frontend
- Netlify Functions for password protection (serverless)
- Deployed via GitHub → Netlify

## Setup Instructions

### 1. Create GitHub Repository

```bash
# Create new repo called "rtf-admin" on GitHub, then:
git init
git add .
git commit -m "Initial admin dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rtf-admin.git
git push -u origin main
```

### 2. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → Log in
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select the `rtf-admin` repository
4. Build settings (should auto-detect from netlify.toml):
   - Build command: (leave empty)
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
5. Click "Deploy site"

### 3. Set Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

| Variable | Value |
|----------|-------|
| `ADMIN_USERNAME` | (choose a username) |
| `ADMIN_PASSWORD` | (choose a strong password) |

**Example:**
- `ADMIN_USERNAME` = `mark`
- `ADMIN_PASSWORD` = `YourSecurePassword123!`

### 4. Configure Custom Domain

1. In Netlify → Site settings → Domain management → Add custom domain
2. Enter: `admin.roundtopfinder.com`
3. Add DNS record at your registrar:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `[your-site-name].netlify.app`

### 5. Enable HTTPS

Netlify automatically provisions SSL certificate once DNS propagates (usually 5-30 minutes).

## Local Development

To test locally:

```bash
npm install -g netlify-cli
netlify dev
```

Then open http://localhost:8888

## File Structure

```
rtf-admin/
├── public/
│   └── index.html          # Main dashboard (protected)
├── netlify/
│   └── functions/
│       └── auth.js         # Password protection logic
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Security Notes

- Credentials are stored as Netlify environment variables (never in code)
- Uses HTTP Basic Authentication
- Session persists until browser is closed
- HTTPS is enforced automatically by Netlify

## API Endpoints Used

The dashboard calls these Round Top Finder API endpoints:

- `GET /api/health` - Basic health check
- `GET /api/status` - Full service status
- `GET /api/warmup` - Warm up ML models
- `GET /api/test-ai` - Test AI routing
- `GET /api/vendors/stats/index` - Search index statistics
- `GET /api/vendors/stats/vendors` - Vendor statistics
- `GET /api/payments/status` - Payment system status
- `GET /api/db/shows/current` - Current show info

## Customization

To add more monitoring panels, edit `public/index.html`. The code is well-commented and follows a card-based pattern that's easy to extend.

## Support

For issues with:
- **This dashboard**: Check browser console for errors
- **API responses**: Check Railway logs for the backend
- **Netlify deployment**: Check Netlify build logs
