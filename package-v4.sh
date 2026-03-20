#!/bin/bash
cd /home/admin/openclaw/workspace/delta-helper

echo "Packaging v4 (PowerShell)..."

rm -rf /tmp/delta-v4
mkdir -p /tmp/delta-v4

cp -r src public electron database docs /tmp/delta-v4/
cp package.json package-lock.json tsconfig.json next.config.js next-env.d.ts /tmp/delta-v4/
cp eslint.config.mjs postcss.config.mjs .env.local.example README.md /tmp/delta-v4/

# PowerShell script + simple batch launcher
cp start.ps1 run.bat /tmp/delta-v4/

cd /tmp
zip -r delta-helper-v4-ps.zip delta-v4/
mv delta-helper-v4-ps.zip /home/admin/openclaw/workspace/backup/

echo "Done: /home/admin/openclaw/workspace/backup/delta-helper-v4-ps.zip"
echo "Size: $(du -h /home/admin/openclaw/workspace/backup/delta-helper-v4-ps.zip | cut -f1)"
rm -rf /tmp/delta-v4
