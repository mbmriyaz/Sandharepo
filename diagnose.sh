#!/bin/bash

echo "=========================================="
echo "🔍 Masjidh Sandha - Docker Diagnostics"
echo "=========================================="
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker-compose ps
echo ""

# Check backend logs
echo "🔌 Backend Logs (last 20 lines):"
docker-compose logs --tail=20 backend
echo ""

# Check frontend logs
echo "🎨 Frontend Logs (last 20 lines):"
docker-compose logs --tail=20 frontend
echo ""

# Test backend API
echo "🧪 Testing Backend API:"
curl -s http://localhost:8000/health | echo "Backend health: $(cat)"
echo ""

# Check if ports are open
echo "🔍 Open Ports:"
netstat -tlnp 2>/dev/null | grep -E '8000|5173' || ss -tlnp | grep -E '8000|5173'
echo ""

echo "=========================================="
echo "💡 Common Fixes:"
echo "=========================================="
echo "1. If backend is not responding:"
echo "   docker-compose restart backend"
echo ""
echo "2. If frontend is blank:"
echo "   docker-compose restart frontend"
echo ""
echo "3. Full reset (loses data):"
echo "   docker-compose down -v"
echo "   rm -rf data/sandha.db"
echo "   docker-compose up --build"
echo ""
echo "4. Rebuild everything:"
echo "   docker-compose down"
echo "   docker-compose up --build"
echo ""