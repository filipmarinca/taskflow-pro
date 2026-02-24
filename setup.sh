#!/bin/bash

echo "🚀 TaskFlow Pro - Quick Start Script"
echo "===================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm globally..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ All prerequisites met!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Setup database
echo "🗄️  Setting up database..."
cd server
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Demo Credentials:"
echo "   Email: demo@taskflow.dev"
echo "   Password: demo123"
echo ""
echo "🚀 To start the development servers:"
echo "   pnpm dev"
echo ""
echo "Or start them separately:"
echo "   Terminal 1: cd server && pnpm dev"
echo "   Terminal 2: cd client && pnpm dev"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🛑 To stop Docker services:"
echo "   docker-compose down"
