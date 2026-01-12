#!/bin/bash

echo ""
echo "================================================"
echo "     BY ORDER OF THE PEAKY BLINDERS... "
echo "     Instalando dependencias do Blinders Bot"
echo "================================================"
echo ""

echo "[1/4] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js nao encontrado!"
    echo "Instale o Node.js antes de continuar."
    exit 1
else
    echo "Node.js encontrado: OK"
fi

echo ""
echo "[2/4] Instalando dependencias via npm..."
npm install

if [ $? -ne 0 ]; then
    echo "ERRO ao instalar dependencias!"
    exit 1
fi

echo ""
echo "[3/4] Limpando cache npm (recomendado)..."
npm cache clean --force

echo ""
echo "[4/4] Instalacao concluida!"
echo ""
echo "Agora e so rodar:"
echo "  node blinders.js"
echo "  ou"
echo "  ./start.sh   (se tiver o script de auto-restart)"
echo ""
echo "By order of the Peaky Blinders. 🧢🔥"
echo "shelbyboss kkkk"
