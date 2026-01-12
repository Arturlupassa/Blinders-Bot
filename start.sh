#!/bin/bash

# Cores pra ficar bonito no terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     BY ORDER OF THE PEAKY BLINDERS...        ║${NC}"
echo -e "${PURPLE}║          BLINDERS BOT INICIANDO              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}🤖 Bot: Blinders Tech API${NC}"
echo -e "${YELLOW}👑 Dono: Artur Shelby (shelbyboss kkkk)${NC}"
echo -e "${GREEN}📡 Iniciando conexão com o WhatsApp...${NC}"
echo ""

while true
do
    echo -e "${BLUE}[$(date +'%d/%m/%Y %H:%M:%S')]${NC} ${GREEN}Iniciando o bot...${NC}"
    echo -e "${YELLOW}entrem na comunidade da 𝑩𝒍𝒊𝒏𝒅𝒆𝒓𝒔 𝑻𝒆𝒄𝒉 API ai família${NC}"
    echo -e "${PURPLE}shelbyboss kkkk 🧢🔥${NC}"
    echo ""

    node blinders.js

    echo ""
    echo -e "${RED}[$(date +'%d/%m/%Y %H:%M:%S')]${NC} ${RED}⚠️ Bot caiu ou foi reiniciado.${NC}"
    echo -e "${YELLOW}🔄 Tentando reconectar em 5 segundos... (A família Shelby não desiste)${NC}"
    echo ""

    sleep 5
done