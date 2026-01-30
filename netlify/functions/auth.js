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
    </style>
</head>
<body>
    <button class="logout-btn" onclick="logout()">Logout</button>

    <div class="header">
        <h1>Round Top Finder</h1>
        <p>Admin Dashboard & System Monitor</p>
        <div class="last-updated" id="lastUpdated">Last updated: Never</div>
        <button class="refresh-all-btn" onclick="refreshAll()">Refresh All</button>
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

        <!-- Error Monitor -->
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
            <div class="endpoint-url">/api/admin/errors</div>
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
                    { name: 'Groq LLM', key: 'ai_agent', subkey: 'groq' },
                    { name: 'Claude AI', key: 'ai_agent', subkey: 'claude' },
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
                const groqCalls = data.groq_calls || 0;
                const claudeCalls = data.claude_calls || 0;
                const totalQueries = data.total_queries || 0;
                const freePercent = parseFloat(data.free_percentage) || 0;

                container.innerHTML =
                    '<div class="stats-row" style="margin-bottom: 15px;">' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #4caf50;">' + groqCalls + '</div>' +
                            '<div class="stat-label">Groq (Free)</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number" style="color: #ff9800;">' + claudeCalls + '</div>' +
                            '<div class="stat-label">Claude (Paid)</div>' +
                        '</div>' +
                        '<div class="stat-box">' +
                            '<div class="stat-number">' + (data.cost_estimate || '$0.00') + '</div>' +
                            '<div class="stat-label">Est. Cost</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="service-list">' +
                        '<div class="service-item"><span class="service-name">Active Sessions</span><span style="color: #4fc3f7; font-weight: 600;">' + (data.active_sessions || 0) + '</span></div>' +
                        '<div class="service-item"><span class="service-name">Free Tier Usage</span><span style="color: ' + (freePercent > 80 ? '#4caf50' : '#ff9800') + '; font-weight: 600;">' + freePercent.toFixed(0) + '%</span></div>' +
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

            const result = await fetchAPI('/api/db/vendors');

            if (result.success) {
                const vendors = result.data.vendors || [];
                const sorted = vendors
                    .filter(v => v.favorite_count > 0)
                    .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
                    .slice(0, 5);

                if (sorted.length === 0) {
                    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No favorites yet</div>';
                } else {
                    let html = '<div class="service-list">';
                    for (const v of sorted) {
                        html += '<div class="service-item">' +
                            '<span class="service-name" style="flex: 1;">' + v.business_name + '</span>' +
                            '<span style="color: #ffc107; font-weight: 600;">&#11088; ' + v.favorite_count + '</span>' +
                        '</div>';
                    }
                    html += '</div>';
                    container.innerHTML = html;
                }
                showRawResponse(result.data, '/api/db/vendors (sorted by favorites)');
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
            setTimeout(function() { checkErrorLog(); }, 3900);
        }

        window.onload = function() {
            refreshAll();
            loadVendorDropdown();
        };
    </script>
</body>
</html>`;
}
