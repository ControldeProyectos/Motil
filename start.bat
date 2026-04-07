@echo off
chcp 65001 >nul
echo ================================
echo   CMEJIA - PROYECTO MOTIL
echo   Dashboard de Control de Obra
echo ================================
echo.

REM Verificar si la base de datos existe
if not exist "backend\data\motil.db" (
    echo Inicializando base de datos por primera vez...
    cd backend
    node src/db/seed.js
    cd ..
    echo.
)

echo Iniciando Backend en http://localhost:3001
start "MOTIL Backend" cmd /k "cd backend && node src/server.js"

echo Esperando que el backend arranque...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend en http://localhost:5173
start "MOTIL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo   Servicios iniciados!
echo ================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   Usuarios:
echo   admin   / admin123   (Administrador)
echo   cmejia  / motil2025  (Editor)
echo   viewer  / ver123     (Solo lectura)
echo.
echo Abriendo navegador...
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo Cierra las ventanas de Backend y Frontend para detener.
pause
