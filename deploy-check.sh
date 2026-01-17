#!/bin/bash

echo "🚀 VERIFICACIÓN PREVIA AL DESPLIEGUE EN AWS APP RUNNER 🚀"
echo "============================================================="

echo "📋 Verificando estructura del proyecto..."

# Verificar archivos importantes
echo "✅ Verificando archivos de configuración:"

if [ -f "apprunner.yaml" ]; then
    echo "  ✅ apprunner.yaml (backend) - OK"
else
    echo "  ❌ apprunner.yaml (backend) - FALTA"
fi

if [ -f "frontend/apprunner.yaml" ]; then
    echo "  ✅ frontend/apprunner.yaml - OK"
else
    echo "  ❌ frontend/apprunner.yaml - FALTA"
fi

if [ -f "backend/package.json" ]; then
    echo "  ✅ backend/package.json - OK"
else
    echo "  ❌ backend/package.json - FALTA"
fi

if [ -f "frontend/package.json" ]; then
    echo "  ✅ frontend/package.json - OK"
else
    echo "  ❌ frontend/package.json - FALTA"
fi

echo ""
echo "🔨 Compilando proyectos..."

# Compilar backend
echo "📦 Compilando backend..."
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Backend compilado exitosamente"
else
    echo "  ❌ Error al compilar backend"
    exit 1
fi
cd ..

# Compilar frontend
echo "📦 Compilando frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Frontend compilado exitosamente"
else
    echo "  ❌ Error al compilar frontend"
    exit 1
fi
cd ..

echo ""
echo "✅ PROYECTO LISTO PARA AWS APP RUNNER!"
echo "=============================================="
echo ""
echo "📋 PASOS PARA DESPLEGAR:"
echo "1. git add -A"
echo "2. git commit -m 'Deploy: Proyecto listo para producción'"
echo "3. git push origin main"
echo ""
echo "🔧 CONFIGURACIÓN AWS APP RUNNER:"
echo "- Puerto Backend: 8080"
echo "- Puerto Frontend: 8080"
echo "- Runtime: Node.js 18"
echo ""
echo "🌍 VARIABLES DE ENTORNO REQUERIDAS EN AWS:"
echo "- MONGODB_URI=tu_connection_string"
echo "- JWT_SECRET=tu_jwt_secret"
echo "- VITE_API_URL=https://tu-backend-url.com/api"
echo ""