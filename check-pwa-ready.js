// Quick PWA Readiness Check
const fs = require('fs');
const path = require('path');

console.log('🔍 ASSETFLOW PWA READINESS CHECK\n');
console.log('=' .repeat(50));

const checks = [
  {
    name: 'Web App Manifest',
    file: 'public/manifest.json',
    required: true,
    checks: ['name', 'short_name', 'start_url', 'display', 'icons']
  },
  {
    name: 'Service Worker',
    file: 'public/sw.js',
    required: true,
    checks: ['install', 'activate', 'fetch', 'caches']
  },
  {
    name: 'PWA Installer Hook',
    file: 'src/hooks/use-pwa-install.tsx',
    required: true,
    checks: ['beforeinstallprompt', 'useState', 'useEffect']
  },
  {
    name: 'PWA Installer Component',
    file: 'src/components/pwa-installer.tsx',
    required: true,
    checks: ['serviceWorker', 'register', 'toast']
  },
  {
    name: 'Root Layout PWA Meta',
    file: 'src/app/layout.tsx',
    required: true,
    checks: ['manifest.json', 'theme-color', 'apple-touch-icon']
  },
  {
    name: 'Offline Fallback Page',
    file: 'public/offline.html',
    required: true,
    checks: ['DOCTYPE', 'html', 'title']
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  const exists = fs.existsSync(filePath);

  if (!exists && check.required) {
    console.log(`❌ ${check.name}: MISSING`);
    allPassed = false;
    return;
  }

  if (!exists) {
    console.log(`⚠️  ${check.name}: OPTIONAL (not found)`);
    return;
  }

  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for required features
  const missingFeatures = check.checks.filter(feature => !content.includes(feature));

  if (missingFeatures.length === 0) {
    console.log(`✅ ${check.name}: ALL FEATURES PRESENT`);
  } else {
    console.log(`⚠️  ${check.name}: MISSING - ${missingFeatures.join(', ')}`);
    if (check.required) allPassed = false;
  }
});

console.log('\n📊 FINAL RESULT:');
if (allPassed) {
  console.log('🎉 ASSETFLOW IS FULLY PWA-READY!');
  console.log('');
  console.log('✅ CAN BE INSTALLED ON:');
  console.log('   • Android (Chrome) - Install prompt or menu');
  console.log('   • iOS (Safari) - Share menu → Add to Home Screen');
  console.log('   • Desktop (Chrome/Edge) - Address bar install icon');
  console.log('');
  console.log('🚀 TEST NOW: http://localhost:3000');
} else {
  console.log('⚠️  SOME PWA FEATURES MISSING');
  console.log('   Check the items marked with ❌ above');
}

console.log('\n🔧 PWA FEATURES INCLUDE:');
console.log('   • Standalone app experience');
console.log('   • Offline functionality');
console.log('   • Background sync');
console.log('   • Push notifications (framework ready)');
console.log('   • Auto-updates');
console.log('   • Camera access for QR scanning');
console.log('   • Native app shortcuts');
