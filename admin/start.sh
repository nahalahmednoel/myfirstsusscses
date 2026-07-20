#!/bin/bash

# MOCHiHOOD Web3 Dashboard - Quick Start Script
# Run this to automatically set up and start the server

echo "🚀 MOCHiHOOD Web3 Dashboard - Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "✓ .env created (update JWT_SECRET in production!)"
    fi
fi

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo ""
echo "Default Credentials:"
echo "  Admin  → username: admin / password: admin2024secure"
echo "  Demo   → username: demo / password: demo123"
echo ""
echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo "===================================="
echo ""

# Start the server
npm start
