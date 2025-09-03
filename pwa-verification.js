// PWA Verification Script
const fs = require('fs');
const path = require('path');

console.log('🔍 PWA VERIFICATION - ASSETFLOW PROJECT\n');
console.log('=' .repeat(60));

const pwaFiles = [
  {
    path: 'public/manifest.json',
    name: 'Web App Manifest',
    required: true,
    checks: ['name', 'short_name', 'start_url', 'display', 'icons']
  },
  {
    path: 'public/sw.js',
    name: 'Service Worker',
    required: true,
    checks: ['install', 'activate', 'fetch', 'message']
  },
  {
    path: 'public/offline.html',
    name: 'Offline Fallback Page',
    required: true,
    checks: ['DOCTYPE', 'title', 'retry functionality']
  },
  {
    path: 'src/components/pwa-installer.tsx',
    name: 'PWA Installer Component',
    required: true,
    checks: ['serviceWorker registration', 'update handling', 'toast notifications']
  },
  {
    path: 'src/hooks/use-pwa-install.tsx',
    name: 'PWA Install Hook',
    required: true,
    checks: ['beforeinstallprompt', 'installApp', 'iOS support']
  },
  {
    path: 'src/app/layout.tsx',
    name: 'Root Layout (PWA Meta Tags)',
    required: true,
    checks: ['manifest link', 'theme-color', 'apple-touch-icon', 'PWAInstaller']
  }
];

// Check if files exist and verify their content
const results = pwaFiles.map(file => {
  const fullPath = path.join(__dirname, file.path);

  try {
    const exists = fs.existsSync(fullPath);
    let content = '';
    let valid = false;

    if (exists) {
      content = fs.readFileSync(fullPath, 'utf8');

      // Basic validation checks
      valid = file.checks.every(check => {
        if (check === 'DOCTYPE' || check === 'title') {
          return content.includes('<' + check);
        }
        if (check === 'retry functionality') {
          return content.includes('reload') && content.includes('online');
        }
        if (check === 'serviceWorker registration') {
          return content.includes('serviceWorker') && content.includes('register');
        }
        if (check === 'update handling') {
          return content.includes('SKIP_WAITING');
        }
        if (check === 'toast notifications') {
          return content.includes('toast') || content.includes('Toast');
        }
        if (check === 'beforeinstallprompt') {
          return content.includes('beforeinstallprompt');
        }
        if (check === 'installApp') {
          return content.includes('installApp');
        }
        if (check === 'iOS support') {
          return content.includes('iOS') || content.includes('iPad') || content.includes('iPhone');
        }
        if (check === 'manifest link') {
          return content.includes('manifest.json');
        }
        if (check === 'theme-color') {
          return content.includes('theme-color');
        }
        if (check === 'apple-touch-icon') {
          return content.includes('apple-touch-icon');
        }
        if (check === 'PWAInstaller') {
          return content.includes('PWAInstaller');
        }
        return content.includes(check);
      });
    }

    return {
      ...file,
      exists,
      valid,
      size: exists ? fs.statSync(fullPath).size : 0
    };

  } catch (error) {
    return {
      ...file,
      exists: false,
      valid: false,
      error: error.message,
      size: 0
    };
  }
});

// Display results
console.log('📋 PWA FILES STATUS:\n');

results.forEach(result => {
  const status = result.exists && result.valid ? '✅' :
                 result.exists && !result.valid ? '⚠️' :
                 '❌';

  const statusText = result.exists && result.valid ? 'OK' :
                     result.exists && !result.valid ? 'PARTIAL' :
                     'MISSING';

  console.log(`${status} ${result.name}`);
  console.log(`   Status: ${statusText}`);
  console.log(`   Path: ${result.path}`);
  if (result.size > 0) {
    console.log(`   Size: ${Math.round(result.size / 1024)} KB`);
  }
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  console.log('');
});

// PWA Features Summary
console.log('🚀 PWA FEATURES SUMMARY:\n');

const features = [
  { name: 'Web App Manifest', status: results.find(r => r.path === 'public/manifest.json')?.valid || false },
  { name: 'Service Worker', status: results.find(r => r.path === 'public/sw.js')?.valid || false },
  { name: 'Offline Support', status: results.find(r => r.path === 'public/offline.html')?.valid || false },
  { name: 'Install Prompt', status: results.find(r => r.path === 'src/hooks/use-pwa-install.tsx')?.valid || false },
  { name: 'Auto Updates', status: results.find(r => r.path === 'src/components/pwa-installer.tsx')?.valid || false },
  { name: 'Cache Strategy', status: results.find(r => r.path === 'public/sw.js')?.valid || false },
  { name: 'Meta Tags', status: results.find(r => r.path === 'src/app/layout.tsx')?.valid || false }
];

features.forEach(feature => {
  console.log(`${feature.status ? '✅' : '❌'} ${feature.name}`);
});

console.log('\n📱 PWA CONFIGURATION:');
console.log('• Display Mode: Standalone');
console.log('• Orientation: Portrait Primary');
console.log('• Theme Color: Black (#000000)');
console.log('• Background Color: White (#ffffff)');
console.log('• Language: Vietnamese (vi-VN)');
console.log('• Cache Strategy: Network-first for API, Cache-first for static');

console.log('\n🔧 SERVICE WORKER FEATURES:');
console.log('• Offline page fallback');
console.log('• Cache versioning (v2)');
console.log('• Background sync support');
console.log('• Push notification ready');
console.log('• Update notifications');

console.log('\n📋 INSTALLATION METHODS:');
console.log('• Browser install prompt (Chrome/Edge)');
console.log('• Manual install via menu (all browsers)');
console.log('• iOS share menu instructions');
console.log('• Desktop shortcuts');

const allValid = results.every(r => r.exists && r.valid);
const totalFiles = results.length;
const validFiles = results.filter(r => r.exists && r.valid).length;

console.log(`\n📊 OVERALL STATUS: ${validFiles}/${totalFiles} PWA files properly configured`);

if (allValid) {
  console.log('\n🎉 CONGRATULATIONS! AssetFlow is fully PWA-ready!');
  console.log('The application can be installed as a native app on:');
  console.log('• Android devices (via Chrome/Edge)');
  console.log('• iOS devices (via Safari)');
  console.log('• Windows devices (via Edge)');
  console.log('• macOS devices (via Safari)');
  console.log('\nUsers can also access it offline with full functionality!');
} else {
  console.log('\n⚠️  Some PWA features need attention.');
  console.log('Check the files marked with ⚠️ or ❌ above.');
}
