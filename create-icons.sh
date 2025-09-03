#!/bin/bash

# Create basic icons for PWA
# This creates simple colored squares as placeholders

mkdir -p public/icons

# Create a simple SVG template
cat > public/icons/icon.svg << EOF
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#6699CC"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">AF</text>
</svg>
EOF

echo "Created basic PWA icon template. You should replace these with proper icons."
echo "For now, copying the SVG as placeholder for different sizes:"

# Copy the SVG as placeholder for different sizes
cp public/icons/icon.svg public/icons/icon-16x16.png
cp public/icons/icon.svg public/icons/icon-32x32.png
cp public/icons/icon.svg public/icons/icon-72x72.png
cp public/icons/icon.svg public/icons/icon-96x96.png
cp public/icons/icon.svg public/icons/icon-128x128.png
cp public/icons/icon.svg public/icons/icon-144x144.png
cp public/icons/icon.svg public/icons/icon-152x152.png
cp public/icons/icon.svg public/icons/icon-192x192.png
cp public/icons/icon.svg public/icons/icon-384x384.png
cp public/icons/icon.svg public/icons/icon-512x512.png

echo "PWA icons created successfully!"
