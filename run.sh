#!/bin/sh
echo "Killing bot"
killall node
echo "Pulling latest changes"
git pull
echo "Running npm install"
npm install
echo "Starting ${BUILD_NUMBER}"
node bot.js
