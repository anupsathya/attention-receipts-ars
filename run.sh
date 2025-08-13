#!/bin/bash

# Start News Swiper Node.js application
echo "Starting News Swiper application..."
echo "Technology: Node.js + Express + SQLite"
echo "Port: 5001"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting server..."
npm start
