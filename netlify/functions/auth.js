const fs = require('fs');
const path = require('path');

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
            <h1>🔐 Round Top Finder Admin</h1>
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
            <h1>❌ Access Denied</h1>
            <p>Invalid username or password.</p>
          </div>
        </body>
        </html>
      `,
    };
  }

  // Credentials valid - serve the dashboard
  // Read the index.html file
  const indexPath = path.join(__dirname, '../../public/index.html');
  
  try {
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
      body: htmlContent,
    };
  } catch (error) {
    console.error('Error reading index.html:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>Could not load the dashboard. Please check the deployment.</p>
          <pre>${error.message}</pre>
        </body>
        </html>
      `,
    };
  }
};
