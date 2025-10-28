#!/bin/bash

# GitHub Pages 배포 스크립트

echo "Building for web..."
npm run build:web

echo "Deploying to GitHub Pages..."
cd dist
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/siam0933-sketch/bus-boarding-app.git
git push -f origin gh-pages

echo "Deployed! URL: https://siam0933-sketch.github.io/bus-boarding-app/"
