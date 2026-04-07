#!/bin/bash
# MOTIL Dashboard - Script de inicio
echo "================================"
echo "  CMEJIA - PROYECTO MOTIL"
echo "  Dashboard de Control de Obra"
echo "================================"
echo ""

# Check if DB needs seeding
if [ ! -f "backend/data/motil.db" ]; then
  echo "⚙️  Inicializando base de datos..."
  cd backend && node src/db/seed.js
  cd ..
  echo "✅ Base de datos lista"
  echo ""
fi

echo "🚀 Iniciando servicios..."
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "   Usuarios:"
echo "   admin   / admin123   (Administrador)"
echo "   cmejia  / motil2025  (Editor)"
echo "   viewer  / ver123     (Solo lectura)"
echo ""
echo "Presiona Ctrl+C para detener"
echo "================================"

# Start backend in background
cd backend && npm start &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
