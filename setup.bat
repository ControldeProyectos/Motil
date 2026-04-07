@echo off
chcp 65001 >nul
echo ================================
echo   CMEJIA - PROYECTO MOTIL
echo   Configuracion inicial
echo ================================
echo.

echo [1/3] Instalando dependencias Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar backend. Verifica que Node.js este instalado.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Instalando dependencias Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar frontend.
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Inicializando base de datos...
cd backend
node src/db/seed.js
cd ..

echo.
echo ================================
echo   Configuracion COMPLETA!
echo ================================
echo.
echo Ahora ejecuta: start.bat
echo.
pause
