# PWA Icons Placeholder

The manifest.json references icon files that don't exist yet. You have two options:

## Option 1: Quick Fix - Remove Icons from Manifest (Recommended for Testing)

Edit `public/manifest.json` and remove or comment out the icons array.

## Option 2: Generate Real Icons

Use a PWA icon generator to create icons from your logo:
- Go to https://favicon.io/favicon-converter/
- Upload a square image (512x512 recommended)
- Download the icon pack
- Extract files to `public/icons/` folder

## Required Icon Sizes for PWA:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

For now, the manifest will work without icons, but you won't be able to install the PWA on mobile devices until icons are added.
