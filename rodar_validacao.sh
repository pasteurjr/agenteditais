#!/bin/bash
# =====================================================
# VALIDACAO SPRINT 2 — Testes Automatizados Visuais
# =====================================================
# Este script roda todos os 47 testes do plano de
# validacao Sprint 2 com o browser ABERTO para voce
# assistir a execucao como se fosse um humano testando.
#
# Requisitos:
#   - Backend rodando na porta 5007
#   - Frontend rodando na porta 5175
#
# Uso:
#   ./rodar_validacao.sh           # Roda tudo (47 testes)
#   ./rodar_validacao.sh parte1    # Grupos 1-3 (19 testes)
#   ./rodar_validacao.sh parte2    # Grupos 4-7 (28 testes)
#   ./rodar_validacao.sh rapido    # Modo rapido (sem slowMo)
# =====================================================

set -e
cd "$(dirname "$0")"

echo "=============================================="
echo "  VALIDACAO SPRINT 2 — RF-001 a RF-037"
echo "  47 Testes Automatizados com Browser Visivel"
echo "=============================================="
echo ""

# Verificar backend
if ! curl -s http://localhost:5007/api/auth/login > /dev/null 2>&1; then
  echo "[ERRO] Backend nao esta rodando na porta 5007!"
  echo "  Execute: cd backend && python app.py"
  exit 1
fi
echo "[OK] Backend rodando na porta 5007"

# Verificar frontend
if ! curl -s http://localhost:5175 > /dev/null 2>&1; then
  echo "[ERRO] Frontend nao esta rodando na porta 5175!"
  echo "  Execute: cd frontend && npm run dev"
  exit 1
fi
echo "[OK] Frontend rodando na porta 5175"
echo ""

MODE="${1:-tudo}"
CONFIG="playwright.visual.config.ts"

if [ "$MODE" = "rapido" ]; then
  CONFIG="playwright.config.ts"
  echo "[MODO] Rapido (headless, sem slowMo)"
else
  echo "[MODO] Visual (browser aberto, slowMo=400ms)"
fi
echo ""

case "$MODE" in
  parte1)
    echo ">>> Rodando PARTE 1: Grupos 1-3 (T-01 a T-19)"
    echo "    Parametrizacoes + Portfolio + Empresa"
    echo ""
    npx playwright test tests/validacao_sprint2.spec.ts \
      --config="$CONFIG" --workers=1
    ;;
  parte2)
    echo ">>> Rodando PARTE 2: Grupos 4-7 (T-20 a T-47)"
    echo "    Captacao + Validacao + Chat + Integrados"
    echo ""
    npx playwright test tests/validacao_sprint2_parte2.spec.ts \
      --config="$CONFIG" --workers=1
    ;;
  rapido)
    echo ">>> Rodando TODOS os testes em modo rapido"
    echo ""
    npx playwright test \
      tests/validacao_sprint2.spec.ts \
      tests/validacao_sprint2_parte2.spec.ts \
      --config="$CONFIG" --workers=1
    ;;
  *)
    echo ">>> Rodando TODOS os 47 testes em modo visual"
    echo "    O browser vai abrir e voce vera cada acao."
    echo "    Tempo estimado: 15-25 minutos"
    echo ""
    npx playwright test \
      tests/validacao_sprint2.spec.ts \
      tests/validacao_sprint2_parte2.spec.ts \
      --config="$CONFIG" --workers=1
    ;;
esac

echo ""
echo "=============================================="
echo "  EXECUCAO CONCLUIDA"
echo "=============================================="
echo ""
echo "Relatorios gerados em:"
echo "  docs/RELATORIO_VALIDACAO_SPRINT2.md"
echo "  docs/RELATORIO_VALIDACAO_SPRINT2_PARTE2.md"
echo ""
echo "Screenshots em:"
echo "  tests/test_screenshots/sprint2/"
echo ""
echo "Videos e traces em:"
echo "  test-results/"
echo ""
