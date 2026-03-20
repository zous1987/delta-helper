#!/bin/bash
cd /home/admin/openclaw/workspace/delta-helper

echo "Packaging v3 (ASCII batch)..."

rm -rf /tmp/delta-v3
mkdir -p /tmp/delta-v3

cp -r src public electron database docs /tmp/delta-v3/
cp package.json package-lock.json tsconfig.json next.config.js next-env.d.ts /tmp/delta-v3/
cp eslint.config.mjs postcss.config.mjs .env.local.example README.md /tmp/delta-v3/

# Use ASCII-only batch file
cp start.bat /tmp/delta-v3/start.bat

# Create simple launcher
echo '@echo off' > /tmp/delta-v3/run.bat
echo 'cd /d "%~dp0"' >> /tmp/delta-v3/run.bat
echo 'start.bat' >> /tmp/delta-v3/run.bat

cd /tmp
zip -r delta-helper-v3-ascii.zip delta-v3/
mv delta-helper-v3-ascii.zip /home/admin/openclaw/workspace/backup/

echo "Done: /home/admin/openclaw/workspace/backup/delta-helper-v3-ascii.zip"
echo "Size: $(du -h /home/admin/openclaw/workspace/backup/delta-helper-v3-ascii.zip | cut -f1)"
rm -rf /tmp/delta-v3
