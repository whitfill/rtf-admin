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

        <!-- Search Analytics -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <span class="icon">&#128200;</span>
                    Search Analytics (30 days)
                </div>
                <button class="refresh-btn" onclick="checkSearchAnalytics()">Refresh</button>
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

        async function checkVendorStats() {
            const container = document.getElementById('vendorContent');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading stats...</div>';

            // Fetch both vendors and venues counts from the database
            const [vendorResult, venueResult] = await Promise.all([
                fetchAPI('/api/db/vendors?limit=1'),
                fetchAPI('/api/db/venues?limit=1')
            ]);

            let vendorCount = '—';
            let venueCount = '—';

            if (vendorResult.success) {
                vendorCount = vendorResult.data.vendors ? vendorResult.data.vendors.length : 0;
                // If there's a count field, use it; otherwise fetch all to count
                if (vendorResult.data.count !== undefined) {
                    vendorCount = vendorResult.data.count;
                } else {
                    const fullResult = await fetchAPI('/api/db/vendors');
                    if (fullResult.success) {
                        vendorCount = fullResult.data.vendors ? fullResult.data.vendors.length : 0;
                    }
                }
            }

            if (venueResult.success) {
                venueCount = venueResult.data.venues ? venueResult.data.venues.length : 0;
                if (venueResult.data.count !== undefined) {
                    venueCount = venueResult.data.count;
                } else {
                    const fullResult = await fetchAPI('/api/db/venues');
                    if (fullResult.success) {
                        venueCount = fullResult.data.venues ? fullResult.data.venues.length : 0;
                    }
                }
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
                const show = result.data;
                container.innerHTML =
                    '<div class="metric" style="margin-top: 10px;">' +
                        '<div class="metric-label">Current/Next Show</div>' +
                        '<div class="metric-value" style="font-size: 1.1rem;">' + (show.name || 'No active show') + '</div>' +
                        '<div style="color: #888; font-size: 0.85rem; margin-top: 5px;">' +
                            (show.start_date ? (show.start_date + ' - ' + show.end_date) : '') +
                        '</div>' +
                    '</div>';
                showRawResponse(result.data, '/api/db/shows/current');
            } else {
                container.innerHTML = '<div class="metric"><div class="metric-label">Current Show</div><div class="metric-value">No active show</div></div>';
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

        function refreshAll() {
            checkHealth();
            setTimeout(function() { checkStatus(); }, 500);
            setTimeout(function() { checkIndexStats(); }, 1000);
            setTimeout(function() { checkVendorStats(); }, 1500);
            setTimeout(function() { checkSearchAnalytics(); }, 2000);
            setTimeout(function() { checkPopularSearches(); }, 2500);
        }

        window.onload = function() {
            refreshAll();
        };
    </script>
</body>
</html>`;
}
