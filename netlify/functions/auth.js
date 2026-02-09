exports.handler = async (event, context) => {
  // Get credentials from environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

  // Check for Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // No credentials provided - prompt for login
    return {
      statusCode: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Round Top Finder Admin"',
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .login-box {
              text-align: center;
              padding: 40px;
            }
            h1 { color: #4fc3f7; }
          </style>
        </head>
        <body>
          <div class="login-box">
            <h1>Round Top Finder Admin</h1>
            <p>Please enter your credentials to continue.</p>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Decode and verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    // Invalid credentials
    return {
      statusCode: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Round Top Finder Admin"',
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Denied</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .error-box {
              text-align: center;
              padding: 40px;
            }
            h1 { color: #f44336; }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h1>Access Denied</h1>
            <p>Invalid username or password.</p>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Credentials valid - serve the dashboard HTML inline
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    body: getDashboardHTML(),
  };
};

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Round Top Finder - Admin Dashboard</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #e0e0e0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
        }

        .header h1 {
            font-size: 2.5rem;
            color: #4fc3f7;
            margin-bottom: 10px;
        }

        .header p {
            color: #888;
            font-size: 1rem;
        }

        .last-updated {
            color: #4fc3f7;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        .refresh-all-btn {
            background: linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1rem;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .refresh-all-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(79, 195, 247, 0.4);
        }

        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            max-width: 1600px;
            margin: 0 auto;
        }

        @media (max-width: 500px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-title {
            font-size: 1.2rem;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card-title .icon {
            font-size: 1.5rem;
        }

        .refresh-btn {
            background: rgba(79, 195, 247, 0.2);
            color: #4fc3f7;
            border: 1px solid #4fc3f7;
            padding: 6px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }

        .refresh-btn:hover {
            background: #4fc3f7;
            color: #1a1a2e;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .status-ok {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
        }

        .status-error {
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
        }

        .status-loading {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .metric {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
        }

        .metric-label {
            color: #888;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .metric-value {
            font-size: 1.4rem;
            font-weight: 600;
            color: #fff;
        }

        .metric-value.good {
            color: #4caf50;
        }

        .metric-value.warning {
            color: #ffc107;
        }

        .metric-value.error {
            color: #f44336;
        }

        .service-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .service-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }

        .service-name {
            font-weight: 500;
        }

        .json-display {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
            overflow-x: auto;
            max-height: 300px;
            overflow-y: auto;
        }

        .json-key {
            color: #4fc3f7;
        }

        .json-string {
            color: #a5d6a7;
        }

        .json-number {
            color: #ffcc80;
        }

        .json-boolean {
            color: #ce93d8;
        }

        .json-null {
            color: #ef9a9a;
        }

        .endpoint-url {
            font-size: 0.75rem;
            color: #666;
            margin-top: 10px;
            font-family: monospace;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }

        .action-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e0e0e0;
            padding: 15px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }

        .action-btn:hover {
            background: rgba(79, 195, 247, 0.2);
            border-color: #4fc3f7;
            color: #4fc3f7;
        }

        .action-btn .action-icon {
            font-size: 1.5rem;
            margin-bottom: 8px;
        }

        .action-btn .action-label {
            font-size: 0.85rem;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #888;
        }

        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(79, 195, 247, 0.3);
            border-top-color: #4fc3f7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 15px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .external-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
        }

        .external-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            color: #4fc3f7;
            text-decoration: none;
            transition: all 0.2s;
        }

        .external-link:hover {
            background: rgba(79, 195, 247, 0.2);
        }

        .card.full-width {
            grid-column: 1 / -1;
        }

        .stats-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .stat-box {
            flex: 1;
            min-width: 120px;
            background: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #4fc3f7;
        }

        .stat-label {
            color: #888;
            font-size: 0.85rem;
            margin-top: 5px;
        }

        .error-message {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid rgba(244, 67, 54, 0.3);
            color: #f44336;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }

        .logout-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
            border: 1px solid #f44336;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }

        .logout-btn:hover {
            background: #f44336;
            color: white;
        }

        /* Section organization */
        .section-header {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 10px;
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
            border-left: 4px solid #4fc3f7;
            margin-top: 10px;
        }

        .section-header:hover {
            background: rgba(255, 255, 255, 0.07);
        }

        .section-header h2 {
            font-size: 0.95rem;
            font-weight: 600;
            color: #fff;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-header .section-count {
            color: #666;
            font-size: 0.75rem;
            font-weight: 400;
        }

        .section-header .toggle-icon {
            font-size: 0.7rem;
            color: #666;
            transition: transform 0.3s;
        }

        .section-header.collapsed .toggle-icon {
            transform: rotate(-90deg);
        }

        .section-content {
            display: contents;
        }

        .section-content.collapsed {
            display: none;
        }

        .section-controls {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .section-controls button {
            background: rgba(255, 255, 255, 0.05);
            color: #888;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 6px 14px;
            border-radius: 15px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
        }

        .section-controls button:hover {
            background: rgba(79, 195, 247, 0.15);
            color: #4fc3f7;
            border-color: rgba(79, 195, 247, 0.3);
        }
    </style>
</head>
<body>
    <button class="logout-btn" onclick="logout()">Logout</button>

    <div class="header">
        <h1>Round Top Finder</h1>
        <p>Admin Dashboard & System Monitor</p>
        <div class="last-updated" id="lastUpdated">Last updated: Never</div>
        <button class="refresh-all-btn" onclick="refreshAll()">Refresh All</button>
        <div class="section-controls">
            <button onclick="collapseAll()">Collapse All</button>
            <button onclick="expandAll()">Expand All</button>
        </div>
    </div>

    <div class="dashboard">
        <!-- System Health Card -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128147;</span>
                    System Health
                </div>
                <button class="refresh-btn" onclick="checkHealth()">Refresh</button>
            </div>
            <div id="healthContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/health</div>
        </div>

        <!-- Full Status Card -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128268;</span>
                    Service Connections
                </div>
                <button class="refresh-btn" onclick="checkStatus()">Refresh</button>
            </div>
            <div id="statusContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/status</div>
        </div>

        <!-- Vector Index Stats -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128269;</span>
                    Search Index Stats
                </div>
                <button class="refresh-btn" onclick="checkIndexStats()">Refresh</button>
            </div>
            <div id="indexContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/vendors/stats/index</div>
        </div>

        <!-- Vendor Stats -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#127978;</span>
                    Vendor Statistics
                </div>
                <button class="refresh-btn" onclick="checkVendorStats()">Refresh</button>
            </div>
            <div id="vendorContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/vendors + /api/db/venues</div>
        </div>

        <!-- AI Usage Stats -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#129302;</span>
                    AI Usage
                </div>
                <button class="refresh-btn" onclick="checkAIStats()">Refresh</button>
            </div>
            <div id="aiStatsContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/agent/stats</div>
        </div>

        <!-- Product Sync Status -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128230;</span>
                    Product Sync Status
                </div>
                <button class="refresh-btn" onclick="checkProductSync()">Refresh</button>
            </div>
            <div id="productSyncContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/scrape/products/status</div>
        </div>

        <!-- Search Analytics -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128200;</span>
                    Search Analytics (30 days)
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="refresh-btn" onclick="checkSearchAnalytics()">Refresh</button>
                    <button class="refresh-btn" style="border-color: #f44336; color: #f44336;" onclick="resetSearchAnalytics()">Reset</button>
                </div>
            </div>
            <div id="searchAnalyticsContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/search-analytics/stats</div>
        </div>

        <!-- Popular Searches -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128293;</span>
                    Popular Searches (7 days)
                </div>
                <button class="refresh-btn" onclick="checkPopularSearches()">Refresh</button>
            </div>
            <div id="popularSearchesContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/search-analytics/popular</div>
        </div>

        <!-- Upcoming Shows -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128197;</span>
                    Upcoming Shows
                </div>
                <button class="refresh-btn" onclick="checkUpcomingShows()">Refresh</button>
            </div>
            <div id="upcomingShowsContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/shows</div>
        </div>

        <!-- Response Times -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#9889;</span>
                    API Response Times
                </div>
                <button class="refresh-btn" onclick="checkResponseTimes()">Refresh</button>
            </div>
            <div id="responseTimesContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/status</div>
        </div>

        <!-- Newsletter Subscribers -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128236;</span>
                    Newsletter Subscribers
                </div>
                <button class="refresh-btn" onclick="checkNewsletterStats()">Refresh</button>
            </div>
            <div id="newsletterContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/newsletter/subscribers</div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128337;</span>
                    Recent Activity
                </div>
                <button class="refresh-btn" onclick="checkRecentActivity()">Refresh</button>
            </div>
            <div id="recentActivityContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">New vendors/venues in last 7 days</div>
        </div>

        <!-- Top Favorited -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#11088;</span>
                    Top Favorited Vendors
                </div>
                <button class="refresh-btn" onclick="checkTopFavorited()">Refresh</button>
            </div>
            <div id="topFavoritedContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">Sorted by favorite_count</div>
        </div>

        <!-- Cron Jobs Status -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128338;</span>
                    Cron Jobs
                </div>
                <button class="refresh-btn" onclick="checkCronStatus()">Refresh</button>
            </div>
            <div id="cronStatusContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/cron/status</div>
        </div>

        <!-- Business Updates -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128227;</span>
                    Business Updates
                </div>
                <button class="refresh-btn" onclick="checkBusinessUpdates()">Refresh</button>
            </div>
            <div id="businessUpdatesContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/business-updates</div>
        </div>

        <!-- Trending Now -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128293;</span>
                    Trending Now
                </div>
                <button class="refresh-btn" onclick="checkTrending()">Refresh</button>
            </div>
            <div id="trendingContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/trending</div>
        </div>

        <!-- Email System -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128231;</span>
                    Email System
                </div>
                <button class="refresh-btn" onclick="checkEmailSystem()">Refresh</button>
            </div>
            <div id="emailSystemContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">Email job status from cron</div>
        </div>

        <!-- Quick Site Links -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#127760;</span>
                    Quick Site Links
                </div>
            </div>
            <div class="external-links">
                <a href="https://roundtopfinder.com" target="_blank" class="external-link">Homepage</a>
                <a href="https://roundtopfinder.com/vendors" target="_blank" class="external-link">Vendors</a>
                <a href="https://roundtopfinder.com/venues" target="_blank" class="external-link">Venues</a>
                <a href="https://roundtopfinder.com/map" target="_blank" class="external-link">Map</a>
                <a href="https://roundtopfinder.com/shows" target="_blank" class="external-link">Shows</a>
                <a href="https://roundtopfinder.com/search" target="_blank" class="external-link">Search</a>
            </div>
        </div>

        <!-- User Growth -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128101;</span>
                    User Growth
                </div>
                <button class="refresh-btn" onclick="checkUserGrowth()">Refresh</button>
            </div>
            <div id="userGrowthContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/user-growth</div>
        </div>

        <!-- Ad Performance -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128202;</span>
                    Ad Performance
                </div>
                <button class="refresh-btn" onclick="checkAdPerformance()">Refresh</button>
            </div>
            <div id="adPerformanceContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/ad-analytics</div>
        </div>

        <!-- Push Notification Health -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128276;</span>
                    Push Notifications
                </div>
                <button class="refresh-btn" onclick="checkPushHealth()">Refresh</button>
            </div>
            <div id="pushHealthContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/push/token-count</div>
        </div>

        <!-- Scraper Health -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128375;</span>
                    Scraper Health
                </div>
                <button class="refresh-btn" onclick="checkScraperHealth()">Refresh</button>
            </div>
            <div id="scraperHealthContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/scrape/stats</div>
        </div>

        <!-- Error Rate -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128680;</span>
                    Error Monitor
                </div>
                <button class="refresh-btn" onclick="checkErrorLog()">Refresh</button>
            </div>
            <div id="errorLogContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/admin/errors</div>
        </div>

        <!-- Email Delivery -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128233;</span>
                    Email Delivery
                </div>
                <button class="refresh-btn" onclick="checkEmailDelivery()">Refresh</button>
            </div>
            <div id="emailDeliveryContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/admin/newsletter/subscribers</div>
        </div>

        <!-- Banner Ads Management -->
        <div class="card" style="grid-column: span 2;">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128444;</span>
                    Banner Ads
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="refresh-btn" onclick="loadBanners()">Refresh</button>
                    <button class="refresh-btn" style="border-color: #4caf50; color: #4caf50;" onclick="showAddBannerForm()">+ Add Banner</button>
                </div>
            </div>
            <div id="bannerFormContainer" style="display: none; margin-bottom: 20px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 10px;">
                <h3 style="color: #4fc3f7; margin-bottom: 15px;" id="bannerFormTitle">Add New Banner</h3>
                <input type="hidden" id="editBannerId" value="">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Name (internal)</label>
                        <input type="text" id="bannerName" placeholder="e.g., Spring Sale - Vendor X" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Placement</label>
                        <select id="bannerPlacement" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                            <option value="homepage">Homepage</option>
                            <option value="vendors">Vendors List</option>
                            <option value="venues">Venues List</option>
                            <option value="dining">Dining</option>
                            <option value="lodging">Lodging</option>
                            <option value="essentials">Essentials</option>
                        </select>
                    </div>
                    <div style="grid-column: span 2;">
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Image URL</label>
                        <input type="text" id="bannerImageUrl" placeholder="https://..." style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Image Width (px)</label>
                        <input type="number" id="bannerWidth" value="1200" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Image Height (px)</label>
                        <input type="number" id="bannerHeight" value="400" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Link Type</label>
                        <select id="bannerLinkType" onchange="updateLinkFields()" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                            <option value="vendor">Vendor Page</option>
                            <option value="venue">Venue Page</option>
                            <option value="external">External URL</option>
                            <option value="screen">App Screen</option>
                        </select>
                    </div>
                    <div id="linkUrlContainer">
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Link URL / ID</label>
                        <input type="text" id="bannerLinkUrl" placeholder="Vendor/Venue ID or URL" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Start Date (optional)</label>
                        <input type="date" id="bannerStartDate" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">End Date (optional)</label>
                        <input type="date" id="bannerEndDate" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; color: #888; font-size: 12px; margin-bottom: 5px;">Position (lower = higher priority)</label>
                        <input type="number" id="bannerPosition" value="0" min="0" style="width: 100%; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="bannerActive" checked style="width: 20px; height: 20px;">
                        <label for="bannerActive" style="color: #888;">Active</label>
                    </div>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="refresh-btn" style="border-color: #4caf50; color: #4caf50; padding: 10px 25px;" onclick="saveBanner()">Save Banner</button>
                    <button class="refresh-btn" style="padding: 10px 25px;" onclick="cancelBannerForm()">Cancel</button>
                </div>
            </div>
            <div id="bannersContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/db/banners</div>
        </div>

        <!-- Ad Marketplace Management -->
        <div class="card" style="grid-column: span 2;">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128227;</span>
                    Ad Marketplace
                </div>
                <button class="refresh-btn" onclick="checkAdMarketplace()">Refresh</button>
            </div>
            <div id="adMarketplaceContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">GET /api/ads/placements</div>
        </div>

        <!-- Ad Waitlist Management -->
        <div class="card" style="grid-column: span 2;">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128276;</span>
                    Ad Waitlist
                </div>
                <button class="refresh-btn" onclick="checkAdWaitlist()">Refresh</button>
            </div>
            <div id="adWaitlistContent">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading...
                </div>
            </div>
            <div class="endpoint-url">Waitlist management across all placements</div>
        </div>

        <!-- Product Management -->
        <div class="card" style="grid-column: span 2;">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128247;</span>
                    Product Management
                </div>
            </div>
            <div style="padding: 15px 0;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                    <select id="vendorSelect" style="flex: 1; min-width: 200px; padding: 10px; background: #2a2a3e; color: white; border: 1px solid #3a3a4e; border-radius: 4px;">
                        <option value="">Select a vendor...</option>
                    </select>
                    <button class="refresh-btn" onclick="loadVendorProducts()" style="padding: 10px 20px;">Load Products</button>
                </div>
                <div id="productManagementContent">
                    <div style="color: #888; text-align: center; padding: 20px;">Select a vendor and click "Load Products" to view indexed images</div>
                </div>
            </div>
            <div class="endpoint-url">/api/admin/products/by-vendor/{vendor}</div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#9889;</span>
                    Quick Actions
                </div>
            </div>
            <div class="quick-actions">
                <button class="action-btn" onclick="warmupModels()">
                    <div class="action-icon">&#128293;</div>
                    <div class="action-label">Warm Up Models</div>
                </button>
                <button class="action-btn" onclick="testAI()">
                    <div class="action-icon">&#129302;</div>
                    <div class="action-label">Test AI</div>
                </button>
                <button class="action-btn" onclick="checkPayments()">
                    <div class="action-icon">&#128179;</div>
                    <div class="action-label">Payment Status</div>
                </button>
                <button class="action-btn" onclick="getCurrentShow()">
                    <div class="action-icon">&#128197;</div>
                    <div class="action-label">Current Show</div>
                </button>
            </div>
            <div id="actionResult" style="margin-top: 15px;"></div>
        </div>

        <!-- External Links -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128279;</span>
                    Service Dashboards
                </div>
            </div>
            <div class="external-links">
                <a href="https://railway.app/dashboard" target="_blank" class="external-link">
                    Railway
                </a>
                <a href="https://supabase.com/dashboard" target="_blank" class="external-link">
                    Supabase
                </a>
                <a href="https://app.pinecone.io" target="_blank" class="external-link">
                    Pinecone
                </a>
                <a href="https://app.baseten.co" target="_blank" class="external-link">
                    Baseten GPU
                </a>
                <a href="https://squareup.com/dashboard" target="_blank" class="external-link">
                    Square
                </a>
                <a href="https://console.groq.com" target="_blank" class="external-link">
                    Groq
                </a>
                <a href="https://console.anthropic.com" target="_blank" class="external-link">
                    Anthropic
                </a>
                <a href="https://aistudio.google.com" target="_blank" class="external-link">
                    Google AI Studio
                </a>
                <a href="https://resend.com/dashboard" target="_blank" class="external-link">
                    Resend
                </a>
            </div>
        </div>

        <!-- Raw Response Viewer -->
        <div class="card full-width">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128203;</span>
                    Raw API Response
                </div>
                <button class="refresh-btn" onclick="clearRawResponse()">Clear</button>
            </div>
            <div id="rawResponse" class="json-display">
                <span style="color: #888;">API responses will appear here formatted...</span>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = 'https://api.roundtopfinder.com';

        function logout() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', window.location.href, true);
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa('logout:logout'));
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    window.location.reload();
                }
            };
            xhr.send();
        }

        function formatJSON(obj, indent = 0) {
            const spaces = '  '.repeat(indent);

            if (obj === null) {
                return '<span class="json-null">null</span>';
            }

            if (typeof obj === 'boolean') {
                return '<span class="json-boolean">' + obj + '</span>';
            }

            if (typeof obj === 'number') {
                return '<span class="json-number">' + obj + '</span>';
            }

            if (typeof obj === 'string') {
                return '<span class="json-string">"' + obj + '"</span>';
            }

            if (Array.isArray(obj)) {
                if (obj.length === 0) return '[]';
                const items = obj.map(item => spaces + '  ' + formatJSON(item, indent + 1)).join(',\\n');
                return '[\\n' + items + '\\n' + spaces + ']';
            }

            if (typeof obj === 'object') {
                const keys = Object.keys(obj);
                if (keys.length === 0) return '{}';
                const items = keys.map(key =>
                    spaces + '  <span class="json-key">"' + key + '"</span>: ' + formatJSON(obj[key], indent + 1)
                ).join(',\\n');
                return '{\\n' + items + '\\n' + spaces + '}';
            }

            return String(obj);
        }

        function showRawResponse(data, endpoint) {
            const container = document.getElementById('rawResponse');
            container.innerHTML = '<div style="color: #888; margin-bottom: 10px;">// ' + endpoint + '</div>' + formatJSON(data);
        }

        function clearRawResponse() {
            document.getElementById('rawResponse').innerHTML = '<span style="color: #888;">API responses will appear here formatted...</span>';
        }

        // === Dashboard Section Organization ===
        function organizeDashboard() {
            var dashboard = document.querySelector('.dashboard');
            if (!dashboard) return;

            // Map content element IDs to section IDs
            var cardMap = {
                'healthContent': 'system',
                'statusContent': 'system',
                'responseTimesContent': 'system',
                'errorLogContent': 'system',
                'cronStatusContent': 'system',

                'vendorContent': 'data',
                'indexContent': 'data',
                'productSyncContent': 'data',
                'scraperHealthContent': 'data',

                'userGrowthContent': 'users',
                'recentActivityContent': 'users',
                'topFavoritedContent': 'users',
                'newsletterContent': 'users',
                'pushHealthContent': 'users',

                'aiStatsContent': 'search',
                'searchAnalyticsContent': 'search',
                'popularSearchesContent': 'search',

                'businessUpdatesContent': 'activity',
                'trendingContent': 'activity',
                'upcomingShowsContent': 'activity',
                'emailSystemContent': 'activity',
                'emailDeliveryContent': 'activity',

                'adPerformanceContent': 'ads',
                'bannersContent': 'ads',
                'adMarketplaceContent': 'ads',
                'adWaitlistContent': 'ads',

                'productManagementContent': 'tools',
                'actionResult': 'tools',
                'rawResponse': 'debug'
            };

            var sections = [
                { id: 'system', title: 'System & Infrastructure', accent: '#ef5350', icon: '&#9881;' },
                { id: 'data', title: 'Content & Data', accent: '#42a5f5', icon: '&#128202;' },
                { id: 'users', title: 'Users & Engagement', accent: '#66bb6a', icon: '&#128101;' },
                { id: 'search', title: 'Search & AI', accent: '#ab47bc', icon: '&#129302;' },
                { id: 'activity', title: 'Activity & Content', accent: '#ffa726', icon: '&#128227;' },
                { id: 'ads', title: 'Advertising', accent: '#ffc107', icon: '&#128444;&#65039;' },
                { id: 'tools', title: 'Tools & Management', accent: '#26a69a', icon: '&#9889;' },
                { id: 'debug', title: 'Debug', accent: '#78909c', icon: '&#128203;' }
            ];

            // Classify all cards
            var allCards = Array.from(dashboard.querySelectorAll('.card'));
            var classified = {};
            var unclassified = [];

            allCards.forEach(function(card) {
                var section = null;

                // Check by content div IDs
                var keys = Object.keys(cardMap);
                for (var i = 0; i < keys.length; i++) {
                    if (card.querySelector('#' + keys[i])) {
                        section = cardMap[keys[i]];
                        break;
                    }
                }

                // Check by title text for cards without content IDs
                if (!section) {
                    var titleEl = card.querySelector('.card-title');
                    var titleText = titleEl ? titleEl.textContent.trim() : '';
                    if (titleText.indexOf('Quick Site Links') !== -1) section = 'tools';
                    else if (titleText.indexOf('Service Dashboards') !== -1) section = 'tools';
                    else unclassified.push(card);
                }

                if (section) {
                    if (!classified[section]) classified[section] = [];
                    classified[section].push(card);
                }
            });

            // Clear and rebuild with sections
            dashboard.innerHTML = '';

            sections.forEach(function(section) {
                var cards = classified[section.id] || [];
                if (cards.length === 0) return;

                // Section header
                var header = document.createElement('div');
                header.className = 'section-header';
                header.id = 'header-' + section.id;
                header.style.borderLeftColor = section.accent;
                header.innerHTML = '<h2>' + section.icon + ' ' + section.title + ' <span class="section-count">(' + cards.length + ')</span></h2><span class="toggle-icon">&#9660;</span>';
                header.onclick = (function(sid) {
                    return function() { toggleSection(sid); };
                })(section.id);
                dashboard.appendChild(header);

                // Content wrapper
                var content = document.createElement('div');
                content.className = 'section-content';
                content.id = 'section-' + section.id;

                cards.forEach(function(card) {
                    content.appendChild(card);
                });

                dashboard.appendChild(content);
            });

            // Append any unclassified cards at the end
            unclassified.forEach(function(card) {
                dashboard.appendChild(card);
            });
        }

        function toggleSection(sectionId) {
            var content = document.getElementById('section-' + sectionId);
            var header = document.getElementById('header-' + sectionId);
            if (content && header) {
                content.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            }
        }

        function collapseAll() {
            var contents = document.querySelectorAll('.section-content');
            var headers = document.querySelectorAll('.section-header');
            contents.forEach(function(c) { c.classList.add('collapsed'); });
            headers.forEach(function(h) { h.classList.add('collapsed'); });
        }

        function expandAll() {
            var contents = document.querySelectorAll('.section-content');
            var headers = document.querySelectorAll('.section-header');
            contents.forEach(function(c) { c.classList.remove('collapsed'); });
            headers.forEach(function(h) { h.classList.remove('collapsed'); });
        }

        function updateLastUpdated() {
            const now = new Date();
            document.getElementById('lastUpdated').textContent = 'Last updated: ' + now.toLocaleTimeString();
        }

        async function fetchAPI(endpoint) {
            try {
                const response = await fetch(API_BASE + endpoint);
                const data = await response.json();
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        async function checkHealth() {
            const container = document.getElementById('healthContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Checking...</div>';

            const result = await fetchAPI('/api/health');

            if (result.success) {
                const isHealthy = result.data.status === 'ok' || result.data.status === 'healthy';
                container.innerHTML =
                    '<div class="metric-grid">' +
                        '<div class="metric">' +
                            '<div class="metric-label">Status</div>' +
                            '<div class="metric-value ' + (isHealthy ? 'good' : 'error') + '">' + (result.data.status ? result.data.status.toUpperCase() : 'UNKNOWN') + '</div>' +
                        '</div>' +
                        '<div class="metric">' +
                            '<div class="metric-label">Version</div>' +
                            '<div class="metric-value" style="font-size: 1rem;">' + (result.data.version || '—') + '</div>' +
                        '</div>' +
                    '</div>';
                showRawResponse(result.data, '/api/health');
            } else {
                container.innerHTML = '<div class="error-message">Failed to connect: ' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkStatus() {
            const container = document.getElementById('statusContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Checking services...</div>';

            const result = await fetchAPI('/api/status');

            if (result.success) {
                const data = result.data;
                const services = data.services || {};
                let servicesHtml = '<div class="service-list">';

                const serviceList = [
                    { name: 'Supabase', key: 'supabase' },
                    { name: 'Pinecone', key: 'pinecone' },
                    { name: 'Claude (Primary)', key: 'ai_agent', subkey: 'claude' },
                    { name: 'Gemini (Backup)', key: 'ai_agent', subkey: 'gemini' },
                    { name: 'Groq (Fallback)', key: 'ai_agent', subkey: 'groq' },
                    { name: 'Baseten GPU', key: 'clip_model' },
                ];

                for (const service of serviceList) {
                    let isOk = false;
                    const svc = services[service.key];
                    if (svc) {
                        if (service.subkey) {
                            isOk = svc[service.subkey] === 'connected';
                        } else {
                            isOk = svc.status === 'up' || svc.status === 'configured';
                        }
                    }

                    servicesHtml +=
                        '<div class="service-item">' +
                            '<span class="service-name">' + service.name + '</span>' +
                            '<span class="status-indicator status-' + (isOk ? 'ok' : 'error') + '">' +
                                '<span class="status-dot"></span>' +
                                (isOk ? 'Connected' : 'Check') +
                            '</span>' +
                        '</div>';
                }

                servicesHtml += '</div>';
                container.innerHTML = servicesHtml;
                showRawResponse(result.data, '/api/status');
            } else {
                container.innerHTML = '<div class="error-message">Failed to connect: ' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkIndexStats() {
            const container = document.getElementById('indexContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading stats...</div>';

            const result = await fetchAPI('/api/vendors/stats/index');

            if (result.success) {
                const data = result.data;
                const namespaces = data.namespaces || {};
                const namespaceCount = typeof namespaces === 'object' ? Object.keys(namespaces).length : 0;

                let html = '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (data.total_vectors ? data.total_vectors.toLocaleString() : '—') + '</div>' +
                            '<div class="stat-label">Total Vectors</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + namespaceCount + '</div>' +
                            '<div class="stat-label">Namespaces</div>' +
                        '</div>' +
                    '</div>';

                if (typeof namespaces === 'object' && Object.keys(namespaces).length > 0) {
                    html += '<div class="service-list">';
                    for (const [name, count] of Object.entries(namespaces)) {
                        html += '<div class="service-item">' +
                            '<span class="service-name">' + name + '</span>' +
                            '<span style="color: #4fc3f7; font-weight: 600;">' + count.toLocaleString() + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                }

                container.innerHTML = html;
                showRawResponse(result.data, '/api/vendors/stats/index');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkAIStats() {
            const container = document.getElementById('aiStatsContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/agent/stats');

            if (result.success) {
                const data = result.data;
                const claudeCalls = data.claude_calls || 0;
                const geminiCalls = data.gemini_calls || 0;
                const groqCalls = data.groq_calls || 0;
                const totalQueries = data.total_queries || 0;
                const freePercent = parseFloat(data.free_percentage) || 0;
                const last30 = data.last_30_days || {};
                const today = data.today || 0;

                const perf = data.performance || {};
                const avgMs = perf.avg_response_ms || 0;
                const p95Ms = perf.p95_response_ms || 0;
                const fastPct = perf.fast_path_pct || 0;
                const slowCount = perf.slow_queries || 0;

                // Color coding for response times
                const avgColor = avgMs < 5000 ? '#4caf50' : avgMs < 10000 ? '#ff9800' : '#f44336';
                const p95Color = p95Ms < 8000 ? '#4caf50' : p95Ms < 15000 ? '#ff9800' : '#f44336';
                const slowColor = slowCount === 0 ? '#4caf50' : slowCount < 5 ? '#ff9800' : '#f44336';

                container.innerHTML =
                    '<div style="font-size: 0.75rem; color: #888; margin-bottom: 8px;">Claude (primary) → Gemini (backup) → Groq (fallback)</div>' +
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #c084fc;">' + claudeCalls + '</div>' +
                            '<div class="stat-label">Claude</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4fc3f7;">' + geminiCalls + '</div>' +
                            '<div class="stat-label">Gemini</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4caf50;">' + groqCalls + '</div>' +
                            '<div class="stat-label">Groq</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (data.cost_estimate || '$0.00') + '</div>' +
                            '<div class="stat-label">Est. Cost</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin: 15px 0 8px; padding-top: 12px; border-top: 1px solid #333;">Response Performance (30d)</div>' +
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + avgColor + '; font-size: 1.3rem;">' + (avgMs ? (avgMs / 1000).toFixed(1) + 's' : '—') + '</div>' +
                            '<div class="stat-label">Avg Response</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + p95Color + '; font-size: 1.3rem;">' + (p95Ms ? (p95Ms / 1000).toFixed(1) + 's' : '—') + '</div>' +
                            '<div class="stat-label">P95 Response</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + (fastPct > 30 ? '#4caf50' : '#4fc3f7') + '; font-size: 1.3rem;">' + fastPct + '%</div>' +
                            '<div class="stat-label">Fast Path</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">Today</span><span style="color: #4fc3f7; font-weight: 600;">' + today + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Last 30 Days</span><span style="color: #4fc3f7; font-weight: 600;">' + (last30.total || totalQueries) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Active Sessions</span><span style="color: #4fc3f7; font-weight: 600;">' + (data.active_sessions || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Free Tier Usage</span><span style="color: ' + (freePercent > 80 ? '#4caf50' : '#ff9800') + '; font-weight: 600;">' + freePercent.toFixed(0) + '%</span></div>' +
                        '<div class="service-item"><span class="service-name">Slow Queries (>10s)</span><span style="color: ' + slowColor + '; font-weight: 600;">' + slowCount + '</span></div>' +
                    '</div>';
                showRawResponse(result.data, '/api/agent/stats');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkProductSync() {
            const container = document.getElementById('productSyncContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/scrape/products/status');

            if (result.success) {
                const data = result.data;
                const inSync = data.in_sync;
                const supabaseCount = data.supabase_tracked_vectors || 0;
                const pineconeCount = data.pinecone_products_namespace || 0;
                const vendors = data.vendors || [];

                let vendorHtml = '';
                for (const v of vendors.slice(0, 5)) {
                    const statusColor = v.scrape_status === 'completed' ? '#4caf50' : (v.scrape_status === 'pending' ? '#ffc107' : '#f44336');
                    vendorHtml += '<div class="service-item">' +
                        '<span class="service-name" style="flex: 1;">' + (v.scraper_type || 'unknown') + '</span>' +
                        '<span style="color: #888; font-size: 0.75rem; margin-right: 10px;">' + (v.products_synced || 0) + ' products</span>' +
                        '<span style="color: ' + statusColor + '; font-size: 0.75rem;">' + (v.scrape_status || 'unknown') + '</span>' +
                    '</div>';
                }

                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + pineconeCount.toLocaleString() + '</div>' +
                            '<div class="stat-label">Indexed Products</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + supabaseCount.toLocaleString() + '</div>' +
                            '<div class="stat-label">DB Tracked</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + (inSync ? '#4caf50' : '#f44336') + ';">' + (inSync ? 'Yes' : 'No') + '</div>' +
                            '<div class="stat-label">In Sync</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' + vendorHtml + '</div>';
                showRawResponse(result.data, '/api/scrape/products/status');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkVendorStats() {
            const container = document.getElementById('vendorContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading stats...</div>';

            // Fetch both vendors and venues counts from the database (no limit to get total count)
            const [vendorResult, venueResult] = await Promise.all([
                fetchAPI('/api/db/vendors'),
                fetchAPI('/api/db/venues')
            ]);

            let vendorCount = '—';
            let venueCount = '—';

            if (vendorResult.success) {
                vendorCount = vendorResult.data.vendors ? vendorResult.data.vendors.length : 0;
            }

            if (venueResult.success) {
                venueCount = venueResult.data.venues ? venueResult.data.venues.length : 0;
            }

            container.innerHTML =
                '<div class="stats-row">' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + vendorCount + '</div>' +
                        '<div class="stat-label">Vendors in DB</div>' +
                    '</div>' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + venueCount + '</div>' +
                        '<div class="stat-label">Venues in DB</div>' +
                    '</div>' +
                '</div>';

            showRawResponse({ vendors: vendorCount, venues: venueCount }, '/api/db/vendors + /api/db/venues');
            updateLastUpdated();
        }

        async function warmupModels() {
            const container = document.getElementById('actionResult');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Warming up models...</div>';

            const result = await fetchAPI('/api/warmup');

            if (result.success) {
                container.innerHTML = '<div class="status-indicator status-ok"><span class="status-dot"></span> Models warmed up successfully!</div>';
                showRawResponse(result.data, '/api/warmup');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
        }

        async function testAI() {
            const container = document.getElementById('actionResult');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Testing AI...</div>';

            const result = await fetchAPI('/api/test-ai');

            if (result.success) {
                container.innerHTML = '<div class="status-indicator status-ok"><span class="status-dot"></span> AI is responding!</div>';
                showRawResponse(result.data, '/api/test-ai');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
        }

        async function checkPayments() {
            const container = document.getElementById('actionResult');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Checking payments...</div>';

            const result = await fetchAPI('/api/payments/status');

            if (result.success) {
                container.innerHTML = '<div class="status-indicator status-ok"><span class="status-dot"></span> Payment system online</div>';
                showRawResponse(result.data, '/api/payments/status');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
        }

        async function getCurrentShow() {
            const container = document.getElementById('actionResult');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Getting show info...</div>';

            const result = await fetchAPI('/api/db/shows/current');

            if (result.success && result.data) {
                // API returns { show: { name, general_start_date, general_end_date, ... } }
                const show = result.data.show || result.data;
                const startDate = show.general_start_date || show.start_date;
                const endDate = show.general_end_date || show.end_date;
                container.innerHTML =
                    '<div class="metric" style="margin-top: 10px;">' +
                        '<div class="metric-label">Current/Next Show</div>' +
                        '<div class="metric-value" style="font-size: 1.1rem;">' + (show.name || 'No active show') + '</div>' +
                        '<div style="color: #888; font-size: 0.85rem; margin-top: 5px;">' +
                            (startDate ? (startDate + ' - ' + endDate) : '') +
                        '</div>' +
                    '</div>';
                showRawResponse(result.data, '/api/db/shows/current');
            } else {
                container.innerHTML = '<div class="metric"><div class="metric-label">Current Show</div><div class="metric-value">No active show</div></div>';
            }
        }

        async function resetSearchAnalytics() {
            if (!confirm('Are you sure you want to clear all search analytics data? This cannot be undone.')) {
                return;
            }

            const container = document.getElementById('searchAnalyticsContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Resetting...</div>';

            try {
                const response = await fetch(API_BASE + '/api/db/admin/search-analytics/reset', { method: 'DELETE' });
                const data = await response.json();

                if (response.ok) {
                    container.innerHTML = '<div class="status-indicator status-ok"><span class="status-dot"></span> ' + data.message + '</div>';
                    // Refresh both analytics cards after reset
                    setTimeout(function() {
                        checkSearchAnalytics();
                        checkPopularSearches();
                    }, 1500);
                } else {
                    container.innerHTML = '<div class="error-message">Failed: ' + (data.detail || 'Unknown error') + '</div>';
                }
            } catch (error) {
                container.innerHTML = '<div class="error-message">Error: ' + error.message + '</div>';
            }
        }

        async function checkSearchAnalytics() {
            const container = document.getElementById('searchAnalyticsContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/admin/search-analytics/stats');

            if (result.success) {
                const data = result.data;
                const byType = data.by_type || {};
                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (data.total_searches || 0) + '</div>' +
                            '<div class="stat-label">Total Searches</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (data.unique_sessions || 0) + '</div>' +
                            '<div class="stat-label">Unique Sessions</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + (parseFloat(data.zero_result_rate) > 50 ? '#f44336' : '#4caf50') + '">' + (data.zero_result_rate || '0%') + '</div>' +
                            '<div class="stat-label">Zero Results</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">Text Searches</span><span style="color: #4fc3f7; font-weight: 600;">' + (byType.text || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Chat Queries</span><span style="color: #4fc3f7; font-weight: 600;">' + (byType.chat || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Visual Searches</span><span style="color: #4fc3f7; font-weight: 600;">' + (byType.visual || 0) + '</span></div>' +
                    '</div>';
                showRawResponse(result.data, '/api/db/admin/search-analytics/stats');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkPopularSearches() {
            const container = document.getElementById('popularSearchesContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/admin/search-analytics/popular?limit=8');

            if (result.success) {
                const searches = result.data.searches || [];
                if (searches.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No searches recorded yet</div>';
                } else {
                    let html = '<div class="service-list">';
                    for (const search of searches) {
                        const typeColor = search.search_type === 'chat' ? '#a5d6a7' : (search.search_type === 'visual' ? '#ce93d8' : '#4fc3f7');
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="flex: 1;">' + search.query + '</span>' +
                            '<span style="color: ' + typeColor + '; font-size: 0.75rem; margin-right: 10px;">' + search.search_type + '</span>' +
                            '<span style="color: #4fc3f7; font-weight: 600;">' + search.count + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/admin/search-analytics/popular');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkUpcomingShows() {
            const container = document.getElementById('upcomingShowsContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/shows');

            if (result.success) {
                const shows = result.data.shows || [];
                // Sort by date and get upcoming/current shows
                const now = new Date();
                const relevantShows = shows
                    .filter(s => new Date(s.general_end_date) >= new Date(now.getTime() - 7*24*60*60*1000))
                    .sort((a, b) => new Date(a.general_start_date) - new Date(b.general_start_date))
                    .slice(0, 4);

                if (relevantShows.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No upcoming shows</div>';
                } else {
                    let html = '<div class="service-list">';
                    for (const show of relevantShows) {
                        const isActive = show.is_active;
                        const statusColor = isActive ? '#4caf50' : '#4fc3f7';
                        const statusText = isActive ? 'ACTIVE' : 'Upcoming';
                        html += '<div class="service-item">' +
                            '<div style="flex: 1;">' +
                                '<div style="font-weight: 600;">' + show.name + '</div>' +
                                '<div style="color: #888; font-size: 0.75rem;">' + show.general_start_date + ' - ' + show.general_end_date + '</div>' +
                            '</div>' +
                            '<span style="color: ' + statusColor + '; font-size: 0.75rem; font-weight: 600;">' + statusText + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/shows');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkResponseTimes() {
            const container = document.getElementById('responseTimesContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/status');

            if (result.success) {
                const times = result.data.response_times || {};
                const overall = result.data.overall || 'unknown';

                let html = '<div class="stats-row" style="margin-bottom: 15px;">' +
                    '<div class="stat-box">' +
                        '<div class="stat-number" style="color: ' + (overall === 'healthy' ? '#4caf50' : '#f44336') + ';">' + overall.toUpperCase() + '</div>' +
                        '<div class="stat-label">Overall Status</div>' +
                    '</div>' +
                '</div>';

                if (Object.keys(times).length > 0) {
                    html += '<div class="service-list">';
                    for (const [service, time] of Object.entries(times)) {
                        const ms = parseInt(time);
                        const color = ms < 200 ? '#4caf50' : (ms < 500 ? '#ffc107' : '#f44336');
                        html += '<div class="service-item">' +
                            '<span class="service-name">' + service + '</span>' +
                            '<span style="color: ' + color + '; font-weight: 600;">' + time + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                }

                container.innerHTML = html;
                showRawResponse(result.data, '/api/status');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkNewsletterStats() {
            const container = document.getElementById('newsletterContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const [shopperResult, vendorResult] = await Promise.all([
                fetchAPI('/api/db/admin/newsletter/subscribers?list_type=shopper'),
                fetchAPI('/api/db/admin/newsletter/subscribers?list_type=vendor')
            ]);

            let shopperCount = 0;
            let vendorCount = 0;

            if (shopperResult.success) {
                shopperCount = shopperResult.data.count || 0;
            }
            if (vendorResult.success) {
                vendorCount = vendorResult.data.count || 0;
            }

            container.innerHTML =
                '<div class="stats-row">' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + shopperCount + '</div>' +
                        '<div class="stat-label">Shoppers</div>' +
                    '</div>' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + vendorCount + '</div>' +
                        '<div class="stat-label">Vendors</div>' +
                    '</div>' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + (shopperCount + vendorCount) + '</div>' +
                        '<div class="stat-label">Total</div>' +
                    '</div>' +
                '</div>';

            showRawResponse({ shoppers: shopperCount, vendors: vendorCount, total: shopperCount + vendorCount }, 'Newsletter Stats');
            updateLastUpdated();
        }

        async function checkRecentActivity() {
            const container = document.getElementById('recentActivityContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const [vendorResult, venueResult] = await Promise.all([
                fetchAPI('/api/db/vendors'),
                fetchAPI('/api/db/venues')
            ]);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            let recentItems = [];

            if (vendorResult.success) {
                const vendors = vendorResult.data.vendors || [];
                for (const v of vendors) {
                    if (v.created_at && new Date(v.created_at) >= sevenDaysAgo) {
                        recentItems.push({ name: v.business_name, type: 'Vendor', date: v.created_at });
                    }
                }
            }

            if (venueResult.success) {
                const venues = venueResult.data.venues || [];
                for (const v of venues) {
                    if (v.created_at && new Date(v.created_at) >= sevenDaysAgo) {
                        recentItems.push({ name: v.name, type: 'Venue', date: v.created_at });
                    }
                }
            }

            // Sort by date descending
            recentItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            recentItems = recentItems.slice(0, 8);

            if (recentItems.length === 0) {
                container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No new activity in the last 7 days</div>';
            } else {
                let html = '<div class="service-list">';
                for (const item of recentItems) {
                    const typeColor = item.type === 'Vendor' ? '#4fc3f7' : '#ce93d8';
                    html += '<div class="service-item">' +
                        '<span class="service-name" style="flex: 1;">' + item.name + '</span>' +
                        '<span style="color: ' + typeColor + '; font-size: 0.75rem; margin-right: 10px;">' + item.type + '</span>' +
                        '<span style="color: #888; font-size: 0.75rem;">' + item.date.slice(0, 10) + '</span>' +
                    '</div>';
                }
                html += '</div>';
                container.innerHTML = html;
            }

            showRawResponse({ recent_items: recentItems.length, period: '7 days' }, 'Recent Activity');
            updateLastUpdated();
        }

        async function checkTopFavorited() {
            const container = document.getElementById('topFavoritedContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/trending/top-favorited?limit=10');

            if (result.success) {
                const vendors = result.data.vendors || [];

                if (vendors.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No favorites yet</div>';
                } else {
                    let html = '<div class="service-list">';
                    for (const v of vendors) {
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="flex: 1;">' + (v.vendor_name || 'Unknown') + '</span>' +
                            '<span style="color: #ffc107; font-weight: 600;">&#11088; ' + v.favorite_count + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                    html += '<div class="endpoint-url" style="margin-top: 8px;">Sorted by favorite_count</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/trending/top-favorited');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkErrorLog() {
            const container = document.getElementById('errorLogContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/admin/errors');

            if (result.success) {
                const errors = result.data.errors || [];
                const count = result.data.count || 0;

                if (count === 0) {
                    container.innerHTML = '<div class="status up" style="margin: 10px 0;"><span class="indicator"></span>No errors logged</div>';
                } else {
                    let html = '<div class="stat-row">' +
                        '<span class="stat-label">Recent Errors</span>' +
                        '<span class="stat-value" style="color: #e74c3c;">' + count + '</span>' +
                    '</div>';
                    html += '<div style="display: flex; gap: 10px; margin: 10px 0;">' +
                        '<button class="action-btn" onclick="clearErrorLog()" style="flex: 1; padding: 8px;">' +
                            '<div class="action-label">Clear Log</div>' +
                        '</button>' +
                    '</div>';
                    html += '<div class="service-list" style="max-height: 200px; overflow-y: auto;">';
                    const recent = errors.slice(-10).reverse();
                    for (const err of recent) {
                        const time = new Date(err.timestamp).toLocaleString();
                        html += '<div class="service-item" style="flex-direction: column; align-items: flex-start;">' +
                            '<div style="display: flex; width: 100%; justify-content: space-between;">' +
                                '<span style="color: #e74c3c; font-weight: 600;">' + (err.error_type || 'Error') + '</span>' +
                                '<span style="color: #888; font-size: 11px;">' + time + '</span>' +
                            '</div>' +
                            '<div style="font-size: 12px; color: #ccc; margin-top: 4px;">' + (err.endpoint || '') + '</div>' +
                            '<div style="font-size: 11px; color: #888; margin-top: 2px; word-break: break-word;">' + (err.message || '').substring(0, 100) + '</div>' +
                        '</div>';
                    }
                    html += '</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/admin/errors');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function clearErrorLog() {
            if (!confirm('Clear all logged errors?')) return;
            const response = await fetch(API_BASE + '/api/admin/errors', { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                checkErrorLog();
            } else {
                alert('Failed to clear error log');
            }
        }

        // === New Monitoring Card Functions ===

        async function checkUserGrowth() {
            const container = document.getElementById('userGrowthContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/admin/user-growth');

            if (result.success) {
                const d = result.data;
                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (d.total_users || 0) + '</div>' +
                            '<div class="stat-label">Total Users</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4caf50;">' + (d.today || 0) + '</div>' +
                            '<div class="stat-label">Today</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4fc3f7;">' + (d.this_week || 0) + '</div>' +
                            '<div class="stat-label">This Week</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">This Month</span><span style="color: #4fc3f7; font-weight: 600;">' + (d.this_month || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Vendors</span><span style="color: #ff9800; font-weight: 600;">' + (d.vendors || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Shoppers</span><span style="color: #4caf50; font-weight: 600;">' + (d.shoppers || 0) + '</span></div>' +
                    '</div>';
                showRawResponse(result.data, '/api/db/admin/user-growth');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkAdPerformance() {
            const container = document.getElementById('adPerformanceContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/admin/ad-analytics');

            if (result.success) {
                const ads = result.data.ads || [];
                const count = result.data.count || 0;

                if (count === 0) {
                    container.innerHTML = '<div class="service-item"><span class="service-name">No active ads</span></div>';
                } else {
                    let totalImpressions = 0;
                    let totalClicks = 0;
                    ads.forEach(function(a) {
                        totalImpressions += (a.impression_count || 0);
                        totalClicks += (a.click_count || 0);
                    });
                    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

                    let html = '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + count + '</div>' +
                            '<div class="stat-label">Active Ads</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + totalImpressions.toLocaleString() + '</div>' +
                            '<div class="stat-label">Impressions</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4caf50;">' + ctr + '%</div>' +
                            '<div class="stat-label">CTR</div>' +
                        '</div>' +
                    '</div>';

                    html += '<div class="service-list" style="max-height: 150px; overflow-y: auto;">';
                    var topAds = ads.slice(0, 5);
                    for (var i = 0; i < topAds.length; i++) {
                        var ad = topAds[i];
                        html += '<div class="service-item">' +
                            '<span class="service-name">' + (ad.placement || 'Unknown') + '</span>' +
                            '<span style="color: #4fc3f7; font-weight: 600;">' + (ad.impression_count || 0) + ' imp</span>' +
                        '</div>';
                    }
                    html += '</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/admin/ad-analytics');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkPushHealth() {
            const container = document.getElementById('pushHealthContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/admin/push/token-count');

            if (result.success) {
                const count = result.data.count || 0;
                const statusColor = count > 0 ? '#4caf50' : '#ff9800';
                const statusText = count > 0 ? 'Active' : 'No Tokens';

                container.innerHTML =
                    '<div class="stats-row">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + count + '</div>' +
                            '<div class="stat-label">Push Tokens</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + statusColor + ';">' + statusText + '</div>' +
                            '<div class="stat-label">Status</div>' +
                        '</div>' +
                    '</div>';
                showRawResponse(result.data, '/api/db/admin/push/token-count');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkScraperHealth() {
            const container = document.getElementById('scraperHealthContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/scrape/stats');

            if (result.success) {
                const d = result.data;
                const scraped = d.successfully_scraped || 0;
                const total = d.vendors_with_website || 0;
                const pct = total > 0 ? ((scraped / total) * 100).toFixed(0) : '0';
                const failed = d.failed_scrape || 0;
                const failColor = failed > 5 ? '#e74c3c' : (failed > 0 ? '#ff9800' : '#4caf50');

                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + scraped + '/' + total + '</div>' +
                            '<div class="stat-label">Scraped (' + pct + '%)</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + failColor + ';">' + failed + '</div>' +
                            '<div class="stat-label">Failed</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">Total Vendors</span><span style="font-weight: 600;">' + (d.total_vendors || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Pending</span><span style="color: #ff9800; font-weight: 600;">' + (d.pending_scrape || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Products</span><span style="color: #4fc3f7; font-weight: 600;">' + (d.total_scraped_products || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Images</span><span style="color: #4fc3f7; font-weight: 600;">' + (d.total_uploaded_images || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Pinecone Vectors</span><span style="color: #4fc3f7; font-weight: 600;">' + (d.total_pinecone_vectors || 0) + '</span></div>' +
                    '</div>';
                showRawResponse(result.data, '/api/scrape/stats');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function checkEmailDelivery() {
            const container = document.getElementById('emailDeliveryContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const [shopperResult, vendorResult] = await Promise.all([
                fetchAPI('/api/db/admin/newsletter/subscribers?list_type=shopper'),
                fetchAPI('/api/db/admin/newsletter/subscribers?list_type=vendor')
            ]);

            let shopperCount = 0;
            let vendorCount = 0;
            if (shopperResult.success) shopperCount = shopperResult.data.count || 0;
            if (vendorResult.success) vendorCount = vendorResult.data.count || 0;
            const total = shopperCount + vendorCount;
            const statusColor = total > 0 ? '#4caf50' : '#ff9800';

            container.innerHTML =
                '<div class="stats-row" style="margin-bottom: 15px;">' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + total + '</div>' +
                        '<div class="stat-label">Subscribers</div>' +
                    '</div>' +
                    '<div class="stat-box">' +
                        '<div class="stat-number" style="color: ' + statusColor + ';">' + (total > 0 ? 'Healthy' : 'Empty') + '</div>' +
                        '<div class="stat-label">Status</div>' +
                    '</div>' +
                '</div>' +
                '<div class="service-list">' +
                    '<div class="service-item"><span class="service-name">Shopper List</span><span style="color: #4fc3f7; font-weight: 600;">' + shopperCount + '</span></div>' +
                    '<div class="service-item"><span class="service-name">Vendor List</span><span style="color: #ff9800; font-weight: 600;">' + vendorCount + '</span></div>' +
                '</div>';
            showRawResponse({ shoppers: shopperCount, vendors: vendorCount, total: total }, 'Email Delivery');
            updateLastUpdated();
        }

        // Product Management Functions
        async function loadVendorDropdown() {
            const select = document.getElementById('vendorSelect');
            const result = await fetchAPI('/api/db/vendors');
            if (result.success && result.data.vendors) {
                const vendors = result.data.vendors.sort((a, b) =>
                    a.business_name.localeCompare(b.business_name)
                );
                select.innerHTML = '<option value="">Select a vendor...</option>';
                for (const v of vendors) {
                    select.innerHTML += '<option value="' + v.business_name + '">' + v.business_name + '</option>';
                }
            }
        }

        async function loadVendorProducts() {
            const select = document.getElementById('vendorSelect');
            const vendorName = select.value;
            if (!vendorName) {
                alert('Please select a vendor first');
                return;
            }

            const container = document.getElementById('productManagementContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading products...</div>';

            const encodedName = encodeURIComponent(vendorName);
            const result = await fetchAPI('/api/admin/products/by-vendor/' + encodedName + '?limit=100');

            if (result.success) {
                const products = result.data.products || [];
                if (products.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No products found for this vendor</div>';
                    return;
                }

                let html = '<div style="margin-bottom: 10px; color: #888;">Found ' + products.length + ' products. Click X to delete unwanted images.</div>';
                html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">';

                for (const p of products) {
                    const imgUrl = p.image_url || '';
                    const name = (p.name || 'Unknown').substring(0, 50);
                    const fullName = p.name || 'Unknown';
                    const pid = p.id;
                    html += '<div class="product-thumb" id="product-' + pid + '" style="position: relative; background: #2a2a3e; border-radius: 4px; overflow: hidden;">';
                    html += '<button data-pid="' + pid + '" onclick="deleteProduct(this.dataset.pid)" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold; z-index: 10;">&times;</button>';
                    html += '<button data-pid="' + pid + '" data-name="' + fullName.replace(/"/g, '&quot;') + '" onclick="editProductName(this.dataset.pid, this.dataset.name)" style="position: absolute; top: 5px; left: 5px; background: #3498db; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; z-index: 10;">&#9998;</button>';
                    if (imgUrl) {
                        html += '<img src="' + imgUrl + '" style="width: 100%; height: 120px; object-fit: cover;" onerror="this.style.display=&apos;none&apos;">';
                    } else {
                        html += '<div style="width: 100%; height: 120px; background: #3a3a4e; display: flex; align-items: center; justify-content: center; color: #666;">No image</div>';
                    }
                    html += '<div id="name-' + pid + '" style="padding: 8px; font-size: 11px; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + fullName.replace(/"/g, '&quot;') + '">' + name + '</div>';
                    html += '</div>';
                }
                html += '</div>';
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
        }

        async function deleteProduct(productId) {
            if (!confirm('Delete this product from search index?')) return;

            try {
                const response = await fetch(API_BASE + '/api/admin/products/' + productId, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    const el = document.getElementById('product-' + productId);
                    if (el) {
                        el.style.opacity = '0.3';
                        el.style.pointerEvents = 'none';
                        el.querySelector('button').style.display = 'none';
                    }
                } else {
                    alert('Failed to delete: ' + (data.detail || 'Unknown error'));
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        function editProductName(productId, currentName) {
            const newName = prompt('Enter new product name:', currentName);
            if (newName === null || newName.trim() === '' || newName === currentName) {
                return;
            }
            saveProductName(productId, newName.trim());
        }

        async function saveProductName(productId, newName) {
            try {
                const response = await fetch(API_BASE + '/api/admin/products/' + productId, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });
                const data = await response.json();

                if (data.success) {
                    const nameEl = document.getElementById('name-' + productId);
                    if (nameEl) {
                        nameEl.textContent = newName.substring(0, 50);
                        nameEl.title = newName;
                    }
                    const editBtn = document.querySelector('[data-pid="' + productId + '"][onclick*="editProductName"]');
                    if (editBtn) {
                        editBtn.dataset.name = newName;
                    }
                } else {
                    alert('Failed to update: ' + (data.detail || 'Unknown error'));
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        // Banner Ads Management Functions
        async function loadBanners() {
            const container = document.getElementById('bannersContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading banners...</div>';

            const result = await fetchAPI('/api/db/banners');

            if (result.success) {
                const banners = result.data.banners || [];
                if (banners.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No banners yet. Click "Add Banner" to create one.</div>';
                    return;
                }

                let html = '<div style="display: grid; gap: 15px;">';
                for (const b of banners) {
                    const isActive = b.is_active;
                    const statusColor = isActive ? '#4caf50' : '#888';
                    const statusText = isActive ? 'Active' : 'Inactive';
                    const imgPreview = b.image_url ? '<img src="' + b.image_url + '" style="width: 120px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.style.display=&apos;none&apos;">' : '<div style="width: 120px; height: 40px; background: #3a3a4e; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 10px;">No image</div>';

                    html += '<div class="service-item" style="flex-wrap: wrap; gap: 10px;">';
                    html += imgPreview;
                    html += '<div style="flex: 1; min-width: 150px;">';
                    html += '<div style="font-weight: 600;">' + (b.name || 'Untitled') + '</div>';
                    html += '<div style="color: #888; font-size: 12px;">' + b.placement + ' &bull; Position: ' + b.position + '</div>';
                    html += '<div style="color: #666; font-size: 11px;">' + (b.start_date || 'No start') + ' - ' + (b.end_date || 'No end') + '</div>';
                    html += '</div>';
                    html += '<div style="display: flex; gap: 8px; align-items: center;">';
                    html += '<span style="color: ' + statusColor + '; font-size: 12px; font-weight: 600;">' + statusText + '</span>';
                    html += '<span style="color: #4fc3f7; font-size: 11px;">' + (b.impression_count || 0) + ' views</span>';
                    html += '<span style="color: #ffc107; font-size: 11px;">' + (b.click_count || 0) + ' clicks</span>';
                    html += '<button class="refresh-btn" style="padding: 5px 10px; font-size: 11px;" onclick="editBanner(&apos;' + b.id + '&apos;)">Edit</button>';
                    html += '<button class="refresh-btn" style="padding: 5px 10px; font-size: 11px; border-color: ' + (isActive ? '#888' : '#4caf50') + '; color: ' + (isActive ? '#888' : '#4caf50') + ';" onclick="toggleBanner(&apos;' + b.id + '&apos;, ' + !isActive + ')">' + (isActive ? 'Pause' : 'Activate') + '</button>';
                    html += '<button class="refresh-btn" style="padding: 5px 10px; font-size: 11px; border-color: #f44336; color: #f44336;" onclick="deleteBanner(&apos;' + b.id + '&apos;)">Delete</button>';
                    html += '</div>';
                    html += '</div>';
                }
                html += '</div>';
                container.innerHTML = html;
                showRawResponse(result.data, '/api/db/banners');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
        }

        function showAddBannerForm() {
            document.getElementById('bannerFormContainer').style.display = 'block';
            document.getElementById('bannerFormTitle').textContent = 'Add New Banner';
            document.getElementById('editBannerId').value = '';
            document.getElementById('bannerName').value = '';
            document.getElementById('bannerPlacement').value = 'homepage';
            document.getElementById('bannerImageUrl').value = '';
            document.getElementById('bannerWidth').value = '1200';
            document.getElementById('bannerHeight').value = '400';
            document.getElementById('bannerLinkType').value = 'vendor';
            document.getElementById('bannerLinkUrl').value = '';
            document.getElementById('bannerStartDate').value = '';
            document.getElementById('bannerEndDate').value = '';
            document.getElementById('bannerPosition').value = '0';
            document.getElementById('bannerActive').checked = true;
        }

        function cancelBannerForm() {
            document.getElementById('bannerFormContainer').style.display = 'none';
        }

        function updateLinkFields() {
            const linkType = document.getElementById('bannerLinkType').value;
            const label = document.querySelector('#linkUrlContainer label');
            const input = document.getElementById('bannerLinkUrl');

            if (linkType === 'vendor') {
                label.textContent = 'Vendor ID (UUID)';
                input.placeholder = 'Paste vendor UUID from database';
            } else if (linkType === 'venue') {
                label.textContent = 'Venue ID (UUID)';
                input.placeholder = 'Paste venue UUID from database';
            } else if (linkType === 'external') {
                label.textContent = 'External URL';
                input.placeholder = 'https://example.com';
            } else {
                label.textContent = 'App Screen Path';
                input.placeholder = '/vendors or /dining etc.';
            }
        }

        async function saveBanner() {
            const editId = document.getElementById('editBannerId').value;
            const name = document.getElementById('bannerName').value.trim();
            const placement = document.getElementById('bannerPlacement').value;
            const imageUrl = document.getElementById('bannerImageUrl').value.trim();
            const width = parseInt(document.getElementById('bannerWidth').value) || 1200;
            const height = parseInt(document.getElementById('bannerHeight').value) || 400;
            const linkType = document.getElementById('bannerLinkType').value;
            const linkUrl = document.getElementById('bannerLinkUrl').value.trim();
            const startDate = document.getElementById('bannerStartDate').value || null;
            const endDate = document.getElementById('bannerEndDate').value || null;
            const position = parseInt(document.getElementById('bannerPosition').value) || 0;
            const isActive = document.getElementById('bannerActive').checked;

            if (!name || !imageUrl) {
                alert('Please fill in name and image URL');
                return;
            }

            const bannerData = {
                name: name,
                placement: placement,
                image_url: imageUrl,
                image_width: width,
                image_height: height,
                link_type: linkType,
                position: position,
                is_active: isActive
            };

            if (startDate) bannerData.start_date = startDate;
            if (endDate) bannerData.end_date = endDate;

            if (linkType === 'vendor' && linkUrl) {
                bannerData.link_vendor_id = linkUrl;
            } else if (linkType === 'venue' && linkUrl) {
                bannerData.link_venue_id = linkUrl;
            } else if (linkUrl) {
                bannerData.link_url = linkUrl;
            }

            try {
                let response;
                if (editId) {
                    response = await fetch(API_BASE + '/api/db/banners/' + editId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bannerData)
                    });
                } else {
                    response = await fetch(API_BASE + '/api/db/banners', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bannerData)
                    });
                }

                const data = await response.json();

                if (response.ok) {
                    cancelBannerForm();
                    loadBanners();
                } else {
                    alert('Failed to save: ' + (data.detail || 'Unknown error'));
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        async function editBanner(bannerId) {
            const result = await fetchAPI('/api/db/banners/' + bannerId);

            if (result.success) {
                const b = result.data;
                document.getElementById('bannerFormContainer').style.display = 'block';
                document.getElementById('bannerFormTitle').textContent = 'Edit Banner';
                document.getElementById('editBannerId').value = bannerId;
                document.getElementById('bannerName').value = b.name || '';
                document.getElementById('bannerPlacement').value = b.placement || 'homepage';
                document.getElementById('bannerImageUrl').value = b.image_url || '';
                document.getElementById('bannerWidth').value = b.image_width || 1200;
                document.getElementById('bannerHeight').value = b.image_height || 400;
                document.getElementById('bannerLinkType').value = b.link_type || 'vendor';
                document.getElementById('bannerLinkUrl').value = b.link_url || b.link_vendor_id || b.link_venue_id || '';
                document.getElementById('bannerStartDate').value = b.start_date || '';
                document.getElementById('bannerEndDate').value = b.end_date || '';
                document.getElementById('bannerPosition').value = b.position || 0;
                document.getElementById('bannerActive').checked = b.is_active !== false;
                updateLinkFields();
            } else {
                alert('Failed to load banner: ' + result.error);
            }
        }

        async function toggleBanner(bannerId, newStatus) {
            try {
                const response = await fetch(API_BASE + '/api/db/banners/' + bannerId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_active: newStatus })
                });

                if (response.ok) {
                    loadBanners();
                } else {
                    alert('Failed to update banner status');
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        async function deleteBanner(bannerId) {
            if (!confirm('Delete this banner? This cannot be undone.')) return;

            try {
                const response = await fetch(API_BASE + '/api/db/banners/' + bannerId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadBanners();
                } else {
                    alert('Failed to delete banner');
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        // Cron Jobs Status
        async function checkCronStatus() {
            const container = document.getElementById('cronStatusContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/cron/status');

            if (result.success) {
                const data = result.data;
                const isConfigured = data.configured;
                const isShowMonth = data.is_show_month;
                const currentMonth = data.current_month;
                const showMonths = data.show_months || [1, 3, 10];
                const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + (isConfigured ? '#4caf50' : '#f44336') + ';">' + (isConfigured ? 'YES' : 'NO') + '</div>' +
                            '<div class="stat-label">Configured</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: ' + (isShowMonth ? '#4caf50' : '#888') + ';">' + (isShowMonth ? 'YES' : 'NO') + '</div>' +
                            '<div class="stat-label">Show Month</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + monthNames[currentMonth] + '</div>' +
                            '<div class="stat-label">Current</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">Weekly Analytics</span><span style="color: #4fc3f7; font-size: 0.75rem;">Mondays 9am CT</span></div>' +
                        '<div class="service-item"><span class="service-name">Favorites Digest</span><span style="color: #4fc3f7; font-size: 0.75rem;">' + (isShowMonth ? 'Weekly' : 'Monthly') + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Profile Nudges</span><span style="color: #4fc3f7; font-size: 0.75rem;">Daily 10am CT</span></div>' +
                        '<div class="service-item"><span class="service-name">Subscription Reminders</span><span style="color: #4fc3f7; font-size: 0.75rem;">Daily 10am CT</span></div>' +
                    '</div>' +
                    '<div style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap;">' +
                        '<button class="refresh-btn" style="font-size: 0.75rem;" onclick="triggerCronJob(\\'favorites-digest\\')">Run Digest</button>' +
                        '<button class="refresh-btn" style="font-size: 0.75rem;" onclick="triggerCronJob(\\'weekly-analytics\\')">Run Analytics</button>' +
                        '<button class="refresh-btn" style="font-size: 0.75rem;" onclick="triggerCronJob(\\'all-daily\\')">Run Daily</button>' +
                    '</div>';
                showRawResponse(result.data, '/api/cron/status');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        async function triggerCronJob(jobName) {
            const container = document.getElementById('cronStatusContent');
            const originalContent = container.innerHTML;
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Triggering ' + jobName + '...</div>';

            try {
                const response = await fetch(API_BASE + '/api/cron/' + jobName, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + (prompt('Enter CRON_SECRET:') || '') }
                });
                const data = await response.json();

                if (response.ok) {
                    alert('Job completed!\\n\\nResults: ' + JSON.stringify(data.results, null, 2));
                    showRawResponse(data, '/api/cron/' + jobName);
                } else {
                    alert('Job failed: ' + (data.detail || 'Unknown error'));
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }

            container.innerHTML = originalContent;
        }

        // Business Updates
        async function checkBusinessUpdates() {
            const container = document.getElementById('businessUpdatesContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/business-updates?limit=10');

            if (result.success) {
                const updates = result.data.updates || [];
                const total = result.data.total || updates.length;

                if (updates.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No business updates yet</div>';
                } else {
                    // Count by category
                    const categoryCounts = {};
                    updates.forEach(u => {
                        const cat = u.category || 'other';
                        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                    });

                    let html = '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + total + '</div>' +
                            '<div class="stat-label">Total Updates</div>' +
                        '</div>' +
                    '</div>';

                    html += '<div class="service-list">';
                    for (const update of updates.slice(0, 6)) {
                        const categoryColors = {
                            'announcement': '#4fc3f7',
                            'event': '#ce93d8',
                            'sale': '#4caf50',
                            'new_arrival': '#ffc107',
                            'hours_update': '#ff9800'
                        };
                        const catColor = categoryColors[update.category] || '#888';
                        const businessName = update.vendor?.business_name || update.venue?.name || 'Unknown';
                        const date = update.created_at ? update.created_at.slice(0, 10) : '';

                        html += '<div class="service-item" style="flex-direction: column; align-items: flex-start;">' +
                            '<div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 4px;">' +
                                '<span style="font-weight: 600; font-size: 0.85rem;">' + (update.title || 'Untitled').substring(0, 40) + '</span>' +
                                '<span style="color: ' + catColor + '; font-size: 0.7rem; text-transform: uppercase;">' + (update.category || 'other') + '</span>' +
                            '</div>' +
                            '<div style="color: #888; font-size: 0.75rem;">' + businessName + ' &bull; ' + date + '</div>' +
                        '</div>';
                    }
                    html += '</div>';

                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/business-updates');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        // Trending Now
        async function checkTrending() {
            const container = document.getElementById('trendingContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/db/trending?days=7');

            if (result.success) {
                const data = result.data;
                const vendors = data.vendors || [];
                const categories = data.categories || [];
                const searches = data.searches || [];

                let html = '<div style="margin-bottom: 10px; color: #888; font-size: 0.75rem;">Last 7 days</div>';

                // Top Vendors
                if (vendors.length > 0) {
                    html += '<div style="margin-bottom: 10px;"><div style="color: #4fc3f7; font-size: 0.8rem; margin-bottom: 5px;">Top Vendors</div>';
                    html += '<div class="service-list">';
                    for (const v of vendors.slice(0, 3)) {
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="font-size: 0.85rem;">' + (v.vendor_name || v.business_name || v.name || 'Unknown') + '</span>' +
                            '<span style="color: #4caf50; font-weight: 600;">' + (v.view_count || v.views || 0) + ' views</span>' +
                        '</div>';
                    }
                    html += '</div></div>';
                }

                // Top Categories
                if (categories.length > 0) {
                    html += '<div style="margin-bottom: 10px;"><div style="color: #ce93d8; font-size: 0.8rem; margin-bottom: 5px;">Hot Categories</div>';
                    html += '<div class="service-list">';
                    for (const c of categories.slice(0, 3)) {
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="font-size: 0.85rem;">' + (c.category || c.name || 'Unknown') + '</span>' +
                            '<span style="color: #ffc107; font-weight: 600;">' + (c.view_count || c.views || 0) + '</span>' +
                        '</div>';
                    }
                    html += '</div></div>';
                }

                // Top Searches
                if (searches.length > 0) {
                    html += '<div><div style="color: #ff9800; font-size: 0.8rem; margin-bottom: 5px;">Top Searches</div>';
                    html += '<div class="service-list">';
                    for (const s of searches.slice(0, 3)) {
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="font-size: 0.85rem;">' + (s.search_query || s.query || s.search_term || 'Unknown') + '</span>' +
                            '<span style="color: #4fc3f7; font-weight: 600;">' + (s.search_count || s.count || 0) + '</span>' +
                        '</div>';
                    }
                    html += '</div></div>';
                }

                if (vendors.length === 0 && categories.length === 0 && searches.length === 0) {
                    html = '<div style="color: #888; text-align: center; padding: 20px;">No trending data yet</div>';
                }

                container.innerHTML = html;
                showRawResponse(result.data, '/api/db/trending');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        // Email System Status
        async function checkEmailSystem() {
            const container = document.getElementById('emailSystemContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            // Get cron status to check if email system is configured
            const result = await fetchAPI('/api/cron/status');

            if (result.success) {
                const data = result.data;
                const isConfigured = data.configured;
                const isShowMonth = data.is_show_month;

                // Email types and their schedules
                const emailJobs = [
                    { name: 'Welcome Email', trigger: 'On signup', status: 'active' },
                    { name: 'Favorites Digest', trigger: isShowMonth ? 'Weekly (show month)' : 'Monthly', status: isConfigured ? 'scheduled' : 'not configured' },
                    { name: 'Weekly Analytics', trigger: 'Mondays', status: isConfigured ? 'scheduled' : 'not configured' },
                    { name: 'Profile Nudges', trigger: '3 days after signup', status: isConfigured ? 'scheduled' : 'not configured' },
                    { name: 'Subscription Reminders', trigger: '7 days before renewal', status: isConfigured ? 'scheduled' : 'not configured' },
                    { name: 'Contact Vendor', trigger: 'On form submit', status: 'active' },
                    { name: 'New Favorite', trigger: 'When favorited', status: 'active' }
                ];

                let html = '<div class="stats-row" style="margin-bottom: 15px;">' +
                    '<div class="stat-box">' +
                        '<div class="stat-number">' + emailJobs.length + '</div>' +
                        '<div class="stat-label">Email Types</div>' +
                    '</div>' +
                    '<div class="stat-box">' +
                        '<div class="stat-number" style="color: ' + (isConfigured ? '#4caf50' : '#f44336') + ';">' + (isConfigured ? 'ON' : 'OFF') + '</div>' +
                        '<div class="stat-label">Cron Active</div>' +
                    '</div>' +
                '</div>';

                html += '<div class="service-list">';
                for (const job of emailJobs) {
                    const statusColor = job.status === 'active' ? '#4caf50' : (job.status === 'scheduled' ? '#4fc3f7' : '#888');
                    html += '<div class="service-item">' +
                        '<div style="flex: 1;">' +
                            '<div style="font-weight: 500; font-size: 0.85rem;">' + job.name + '</div>' +
                            '<div style="color: #666; font-size: 0.7rem;">' + job.trigger + '</div>' +
                        '</div>' +
                        '<span style="color: ' + statusColor + '; font-size: 0.7rem; text-transform: uppercase;">' + job.status + '</span>' +
                    '</div>';
                }
                html += '</div>';

                html += '<div style="margin-top: 10px;"><a href="https://resend.com/emails" target="_blank" class="external-link" style="font-size: 0.8rem;">View in Resend Dashboard &rarr;</a></div>';

                container.innerHTML = html;
                showRawResponse({ email_jobs: emailJobs, cron_configured: isConfigured }, 'Email System Status');
            } else {
                container.innerHTML = '<div class="error-message">' + result.error + '</div>';
            }
            updateLastUpdated();
        }

        function refreshAll() {
            checkHealth();
            setTimeout(function() { checkStatus(); }, 300);
            setTimeout(function() { checkIndexStats(); }, 600);
            setTimeout(function() { checkVendorStats(); }, 900);
            setTimeout(function() { checkAIStats(); }, 1200);
            setTimeout(function() { checkProductSync(); }, 1500);
            setTimeout(function() { checkSearchAnalytics(); }, 1800);
            setTimeout(function() { checkPopularSearches(); }, 2100);
            setTimeout(function() { checkUpcomingShows(); }, 2400);
            setTimeout(function() { checkResponseTimes(); }, 2700);
            setTimeout(function() { checkNewsletterStats(); }, 3000);
            setTimeout(function() { checkRecentActivity(); }, 3300);
            setTimeout(function() { checkTopFavorited(); }, 3600);
            setTimeout(function() { checkCronStatus(); }, 3900);
            setTimeout(function() { checkBusinessUpdates(); }, 4200);
            setTimeout(function() { checkTrending(); }, 4500);
            setTimeout(function() { checkEmailSystem(); }, 4800);
            setTimeout(function() { checkErrorLog(); }, 5100);
            setTimeout(function() { loadBanners(); }, 5400);
            setTimeout(function() { checkAdMarketplace(); }, 5700);
            setTimeout(function() { checkAdWaitlist(); }, 6000);
            setTimeout(function() { checkUserGrowth(); }, 6300);
            setTimeout(function() { checkAdPerformance(); }, 6600);
            setTimeout(function() { checkPushHealth(); }, 6900);
            setTimeout(function() { checkScraperHealth(); }, 7200);
            setTimeout(function() { checkEmailDelivery(); }, 7500);
        }

        // Ad Marketplace Management
        async function checkAdMarketplace() {
            const container = document.getElementById('adMarketplaceContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            const result = await fetchAPI('/api/ads/placements');

            if (result.success) {
                const placements = result.data.placements || [];
                if (placements.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No ad placements configured.</div>';
                    return;
                }

                // Separate premium and standard
                const premium = placements.filter(p => p.tier === 'premium');
                const standard = placements.filter(p => p.tier === 'standard');

                let html = '<div style="display: grid; grid-template-columns: 1fr; gap: 20px;">';

                // Premium Section
                html += '<div>';
                html += '<h4 style="color: #ffc107; margin-bottom: 12px;">&#128081; Premium Placements</h4>';
                html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">';
                html += '<tr style="border-bottom: 1px solid #3a3a4e;">';
                html += '<th style="text-align: left; padding: 8px; color: #888;">Placement</th>';
                html += '<th style="text-align: center; padding: 8px; color: #888;">Slots</th>';
                html += '<th style="text-align: center; padding: 8px; color: #888;">Used</th>';
                html += '<th style="text-align: center; padding: 8px; color: #888;">Available</th>';
                html += '<th style="text-align: right; padding: 8px; color: #888;">Price/mo</th>';
                html += '</tr>';

                premium.forEach(p => {
                    const available = p.spots_remaining !== null ? p.spots_remaining : '∞';
                    const statusColor = p.available ? '#4caf50' : '#f44336';
                    html += '<tr style="border-bottom: 1px solid #2a2a3e;">';
                    html += '<td style="padding: 8px;">' + p.display_name + '</td>';
                    html += '<td style="padding: 8px; text-align: center;">' + (p.total_slots || '∞') + '</td>';
                    html += '<td style="padding: 8px; text-align: center;">' + (p.current_ads || 0) + '</td>';
                    html += '<td style="padding: 8px; text-align: center; color: ' + statusColor + ';">' + available + '</td>';
                    html += '<td style="padding: 8px; text-align: right;">$' + (p.monthly_rate_cents / 100) + '</td>';
                    html += '</tr>';
                });
                html += '</table></div>';

                // Standard Section
                html += '<div>';
                html += '<h4 style="color: #4caf50; margin-bottom: 12px;">&#128260; Standard Placements (Rotation)</h4>';
                html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">';
                html += '<tr style="border-bottom: 1px solid #3a3a4e;">';
                html += '<th style="text-align: left; padding: 8px; color: #888;">Placement</th>';
                html += '<th style="text-align: center; padding: 8px; color: #888;">Active Ads</th>';
                html += '<th style="text-align: center; padding: 8px; color: #888;">Max Per Category</th>';
                html += '<th style="text-align: right; padding: 8px; color: #888;">Price/mo</th>';
                html += '</tr>';

                standard.forEach(p => {
                    html += '<tr style="border-bottom: 1px solid #2a2a3e;">';
                    html += '<td style="padding: 8px;">' + p.display_name + '</td>';
                    html += '<td style="padding: 8px; text-align: center;">' + (p.current_ads || 0) + '</td>';
                    html += '<td style="padding: 8px; text-align: center;">' + (p.max_same_category || 2) + '</td>';
                    html += '<td style="padding: 8px; text-align: right;">$' + (p.monthly_rate_cents / 100) + '</td>';
                    html += '</tr>';
                });
                html += '</table></div>';

                html += '</div>';

                // Summary stats
                const totalPremiumSlots = premium.reduce((sum, p) => sum + (p.total_slots || 0), 0);
                const usedPremiumSlots = premium.reduce((sum, p) => sum + (p.current_ads || 0), 0);
                const totalStandardAds = standard.reduce((sum, p) => sum + (p.current_ads || 0), 0);

                html += '<div style="margin-top: 20px; padding: 15px; background: rgba(79, 195, 247, 0.1); border-radius: 8px; display: flex; gap: 30px; flex-wrap: wrap;">';
                html += '<div><span style="color: #888;">Premium Slots:</span> <strong>' + usedPremiumSlots + '/' + totalPremiumSlots + '</strong></div>';
                html += '<div><span style="color: #888;">Standard Ads Active:</span> <strong>' + totalStandardAds + '</strong></div>';
                html += '</div>';

                container.innerHTML = html;
            } else {
                container.innerHTML = '<div style="color: #f44336; padding: 20px;">Error loading ad placements: ' + (result.error || 'Unknown error') + '</div>';
            }
        }

        // Ad Waitlist Management
        async function checkAdWaitlist() {
            const container = document.getElementById('adWaitlistContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            // Get all waitlist entries
            const result = await fetchAPI('/api/ads/waitlist/all');

            if (result.success) {
                const entries = result.data.entries || [];

                if (entries.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No vendors on waitlists.</div>';
                    return;
                }

                // Group by placement
                const byPlacement = {};
                entries.forEach(e => {
                    if (!byPlacement[e.placement]) {
                        byPlacement[e.placement] = [];
                    }
                    byPlacement[e.placement].push(e);
                });

                let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';

                Object.keys(byPlacement).forEach(placement => {
                    const list = byPlacement[placement].sort((a, b) => a.position - b.position);
                    html += '<div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px;">';
                    html += '<h4 style="color: #4fc3f7; margin-bottom: 12px;">' + (list[0].ad_placement_config?.display_name || placement) + '</h4>';
                    html += '<div style="display: flex; flex-direction: column; gap: 8px;">';

                    list.forEach(entry => {
                        const statusColor = entry.status === 'notified' ? '#ffc107' : '#4caf50';
                        const statusText = entry.status === 'notified' ? 'NOTIFIED' : '#' + entry.position;
                        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">';
                        html += '<div>';
                        html += '<div style="font-weight: 500;">' + (entry.business_name || 'Unknown Vendor') + '</div>';
                        html += '<div style="font-size: 0.8em; color: #888;">' + entry.email + '</div>';
                        html += '</div>';
                        html += '<div style="display: flex; align-items: center; gap: 10px;">';
                        html += '<span style="color: ' + statusColor + '; font-weight: 600;">' + statusText + '</span>';
                        if (entry.status === 'waiting') {
                            html += '<button onclick="notifyWaitlistEntry(\\'' + entry.id + '\\', \\'' + placement + '\\')" style="padding: 4px 10px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em;">Notify</button>';
                        }
                        html += '</div>';
                        html += '</div>';
                    });

                    html += '</div></div>';
                });

                html += '</div>';
                container.innerHTML = html;
            } else {
                // API might not exist yet, show placeholder
                container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">Waitlist API not available. Run the database migration first.</div>';
            }
        }

        async function notifyWaitlistEntry(entryId, placement) {
            if (!confirm('Notify this vendor that a slot is available?')) return;

            const container = document.getElementById('adWaitlistContent');
            const originalContent = container.innerHTML;
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Sending notification...</div>';

            try {
                const response = await fetch(API_BASE + '/api/ads/waitlist/' + placement + '/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entry_id: entryId })
                });

                if (response.ok) {
                    await checkAdWaitlist(); // Refresh
                } else {
                    container.innerHTML = originalContent;
                    alert('Failed to send notification');
                }
            } catch (error) {
                container.innerHTML = originalContent;
                alert('Error: ' + error.message);
            }
        }

        window.onload = function() {
            organizeDashboard();
            refreshAll();
            loadVendorDropdown();
        };
    </script>
</body>
</html>`;
}
