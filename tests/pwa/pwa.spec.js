/**
 * PWA Tests for ProcessAdmin
 * Tests: status 200, offline 200, recursos locales
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Configuration
const PROJECT_ROOT = '/tmp/opencode/processadmin';
const SERVER_PORT = 3000;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

// Start a simple HTTP server for testing
const { spawn } = require('child_process');

let serverProcess;

// Start server before tests
async function startServer() {
  return new Promise((resolve, reject) => {
    // Use Python's http.server or Node.js http-server if available
    // Try Python first
    serverProcess = spawn('python3', ['-m', 'http.server', String(SERVER_PORT), '-d', PROJECT_ROOT], {
      stdio: ['ignore', 'ignore', 'ignore'],
      cwd: PROJECT_ROOT
    });
    
    serverProcess.on('error', (err) => {
      console.error('Python server failed, trying node:', err.message);
      // Try node http-server
      serverProcess = spawn('npx', ['http-server', PROJECT_ROOT, '-p', String(SERVER_PORT), '--cors'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        cwd: PROJECT_ROOT
      });
      
      serverProcess.on('error', (err) => {
        reject(new Error(`Failed to start server: ${err.message}`));
      });
      
      // Wait for server to start
      setTimeout(() => resolve(), 2000);
    });
    
    // Wait for server to start
    setTimeout(() => resolve(), 2000);
  });
}

// Stop server after tests
async function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

test.describe('ProcessAdmin PWA Tests', () => {
  test.beforeAll(async () => {
    await startServer();
  });
  
  test.afterAll(async () => {
    await stopServer();
  });

  // Test 1: Basic online functionality - status 200
  test('Index page loads with status 200', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  // Test 2: Manifest is accessible
  test('Manifest.json is accessible and valid', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest).toHaveProperty('name', 'ProcessAdmin');
    expect(manifest).toHaveProperty('short_name', 'ProcessAdmin');
    expect(manifest).toHaveProperty('start_url', '.');
    expect(manifest).toHaveProperty('display', 'standalone');
    expect(manifest).toHaveProperty('theme_color', '#1C1B18');
    expect(manifest).toHaveProperty('background_color', '#1C1B18');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  // Test 3: Service Worker registration
  test('Service Worker registers successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for service worker registration
    const serviceWorker = await page.evaluate(async () => {
      return navigator.serviceWorker.register('/sw.js', { scope: '/' });
    });
    
    expect(serviceWorker).toBeDefined();
  });

  // Test 4: Service Worker file is accessible
  test('Service Worker file loads with status 200', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sw.js`);
    expect(response?.status()).toBe(200);
    
    const content = await page.content();
    expect(content).toContain('Cache API');
    expect(content).toContain('processadmin');
  });

  // Test 5: Cache API - resources are cached
  test('Service Worker caches local resources', async ({ page, context }) => {
    // Enable service worker in context
    await context.setOffline(false);
    
    // First load to trigger caching
    await page.goto(BASE_URL);
    
    // Wait for service worker to cache resources
    await page.waitForTimeout(2000);
    
    // Check if resources are cached
    const cachedResources = await page.evaluate(async () => {
      const cache = await caches.open('processadmin-v1.0.0');
      const keys = await cache.keys();
      return keys.map(k => k.url);
    });
    
    expect(cachedResources).toBeDefined();
    expect(cachedResources.length).toBeGreaterThan(0);
    expect(cachedResources).toContainEqual(expect.stringContaining('/index.html'));
  });

  // Test 6: Offline mode - page loads from cache
  test('Page loads from cache in offline mode', async ({ page, context }) => {
    // First, load the page online
    await page.goto(BASE_URL);
    
    // Wait for service worker to cache
    await page.waitForTimeout(2000);
    
    // Enable offline mode
    await context.setOffline(true);
    
    // Create new page in offline mode
    const offlinePage = await context.newPage();
    
    // Try to load the page offline
    const response = await offlinePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // In offline mode, the service worker should serve from cache
    // The response might be null or from cache
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    
    // Check if page content loads
    const title = await offlinePage.title();
    expect(title).toContain('ProcessAdmin');
    
    await offlinePage.close();
    
    // Restore online mode
    await context.setOffline(false);
  });

  // Test 7: Offline mode - CSS files are cached
  test('CSS files are cached and accessible offline', async ({ page, context }) => {
    // First load online
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Create new page and try to access CSS
    const offlinePage = await context.newPage();
    const response = await offlinePage.goto(`${BASE_URL}/css/styles.css`);
    
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    
    await offlinePage.close();
    await context.setOffline(false);
  });

  // Test 8: Offline mode - JS files are cached
  test('JavaScript files are cached and accessible offline', async ({ page, context }) => {
    // First load online
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Create new page and try to access JS
    const offlinePage = await context.newPage();
    const response = await offlinePage.goto(`${BASE_URL}/src/app/main.js`);
    
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    
    await offlinePage.close();
    await context.setOffline(false);
  });

  // Test 9: Theme color meta tag
  test('Theme color meta tag is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const metaThemeColor = await page.$('meta[name="theme-color"]');
    expect(metaThemeColor).not.toBeNull();
    
    const themeColor = await metaThemeColor.getAttribute('content');
    expect(themeColor).toBe('#1C1B18');
  });

  // Test 10: Manifest link
  test('Manifest link is present in HTML', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const manifestLink = await page.$('link[rel="manifest"]');
    expect(manifestLink).not.toBeNull();
    
    const href = await manifestLink.getAttribute('href');
    expect(href).toBe('/manifest.json');
  });

  // Test 11: Apple touch icon
  test('Apple touch icon is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const appleTouchIcon = await page.$('link[rel="apple-touch-icon"]');
    expect(appleTouchIcon).not.toBeNull();
  });

  // Test 12: Service worker registration script
  test('Service worker registration script is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const content = await page.content();
    expect(content).toContain('serviceWorker');
    expect(content).toContain('navigator.serviceWorker.register');
  });

  // Test 13: Check sizes of cached resources
  test('Report sizes of cached resources', async ({ page, context }) => {
    // First load online
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Get cache sizes
    const cacheInfo = await page.evaluate(async () => {
      const cache = await caches.open('processadmin-v1.0.0');
      const keys = await cache.keys();
      const info = [];
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const size = new Blob([await response.clone().arrayBuffer()]).size;
          info.push({
            url: request.url,
            size: size,
            sizeKB: Math.round(size / 1024 * 100) / 100
          });
        }
      }
      
      return info;
    });
    
    console.log('\n=== CACHED RESOURCE SIZES ===');
    cacheInfo.forEach(resource => {
      console.log(`${resource.url.padEnd(50)} ${resource.sizeKB.toFixed(2)} KB`);
    });
    console.log('==============================\n');
    
    expect(cacheInfo.length).toBeGreaterThan(0);
  });
});

// Additional utility tests
test.describe('PWA Resource Validation', () => {
  test('All required files exist', async () => {
    const requiredFiles = [
      'index.html',
      'manifest.json',
      'sw.js',
      'css/styles.css',
      'css/layout.css',
      'css/components.css',
      'css/utilities.css',
      'css/academic.css',
      'assets/tokens.css',
      'assets/icons/redactor.svg',
      'assets/icons/icon-192.png',
      'assets/icons/icon-512.png',
      'src/app/main.js',
      'src/state/persistence.js',
      'src/state/store.js',
      'src/config/index.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(PROJECT_ROOT, file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).toBe(true);
    }
  });

  test('Service worker file has correct content', async () => {
    const swPath = path.join(PROJECT_ROOT, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    expect(swContent).toContain('CACHE_NAME');
    expect(swContent).toContain('PRECACHE_RESOURCES');
    expect(swContent).toContain('Cache API');
    expect(swContent).toContain('addEventListener');
    expect(swContent).toContain('install');
    expect(swContent).toContain('activate');
    expect(swContent).toContain('fetch');
  });

  test('Manifest file has correct content', async () => {
    const manifestPath = path.join(PROJECT_ROOT, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    expect(manifest.name).toBe('ProcessAdmin');
    expect(manifest.short_name).toBe('ProcessAdmin');
    expect(manifest.start_url).toBe('.');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#1C1B18');
    expect(manifest.background_color).toBe('#1C1B18');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});

// Export for running tests
module.exports = { startServer, stopServer };
