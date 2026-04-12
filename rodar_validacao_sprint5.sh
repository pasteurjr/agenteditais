#!/bin/bash
# =====================================================
# VALIDACAO SPRINT 5 — Testes Automatizados Visuais
# =====================================================
# Roda os 11 testes V3 novos (UC-CT07..10 + UC-CRM01..07)
# após popular o banco com seed idempotente.
#
# Requisitos:
#   - Backend rodando na porta 5007
#   - Frontend rodando na porta 5179
#
# Uso:
#   ./rodar_validacao_sprint5.sh          # Roda tudo
#   ./rodar_validacao_sprint5.sh seed     # So roda o seed
#   ./rodar_validacao_sprint5.sh tests    # So roda os testes
# =====================================================

set -e
cd "$(dirname "$0")"

MODE="${1:-tudo}"

echo "=============================================="
echo "  VALIDACAO SPRINT 5 V3 — RF-045/046/047/048"
echo "  11 Testes E2E (UC-CT07-10 + UC-CRM01-07)"
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
if ! curl -s http://localhost:5179 > /dev/null 2>&1; then
  echo "[ERRO] Frontend nao esta rodando na porta 5179!"
  echo "  Execute: cd frontend && npm run dev"
  exit 1
fi
echo "[OK] Frontend rodando na porta 5179"
echo ""

# Rodar seed
if [ "$MODE" = "tudo" ] || [ "$MODE" = "seed" ]; then
  echo ">>> Rodando seed Sprint 5 (idempotente)"
  cd backend
  python seeds/sprint5_seed.py
  cd ..
  echo ""
fi

# Rodar testes
if [ "$MODE" = "tudo" ] || [ "$MODE" = "tests" ]; then
  echo ">>> Rodando 11 testes Playwright Sprint 5 V3"
  echo "    UC-CT07: Gestao de Empenhos"
  echo "    UC-CT08: Auditoria Empenho x Fatura x Entrega"
  echo "    UC-CT09: Contratos a Vencer (5 tiers)"
  echo "    UC-CT10: KPIs Execucao"
  echo "    UC-CRM01: Pipeline 13 Stages"
  echo "    UC-CRM02: Parametrizacoes CRM"
  echo "    UC-CRM03: Mapa por UF"
  echo "    UC-CRM04: Agenda com Urgencia"
  echo "    UC-CRM05: KPIs CRM"
  echo "    UC-CRM06: Decisao Nao-Participacao"
  echo "    UC-CRM07: Motivo de Perda"
  echo ""

  npx playwright test \
    tests/e2e/playwright/uc-ct07.spec.ts \
    tests/e2e/playwright/uc-ct08.spec.ts \
    tests/e2e/playwright/uc-ct09.spec.ts \
    tests/e2e/playwright/uc-ct10.spec.ts \
    tests/e2e/playwright/uc-crm01.spec.ts \
    tests/e2e/playwright/uc-crm02.spec.ts \
    tests/e2e/playwright/uc-crm03.spec.ts \
    tests/e2e/playwright/uc-crm04.spec.ts \
    tests/e2e/playwright/uc-crm05.spec.ts \
    tests/e2e/playwright/uc-crm06.spec.ts \
    tests/e2e/playwright/uc-crm07.spec.ts \
    --workers=10
fi

echo ""
echo "=============================================="
echo "  EXECUCAO CONCLUIDA"
echo "=============================================="
echo ""
echo "Screenshots em:"
echo "  runtime/screenshots/UC-CT07..CT10/"
echo "  runtime/screenshots/UC-CRM01..CRM07/"
echo ""
echo "Relatorio:"
echo "  docs/RESULTADO VALIDACAO SPRINT5.md"
echo "  docs/relatorio_aceitacao_sprint5.md"
echo ""
echo "IMPORTANTE: lembrar de parar o backend e frontend apos validar."
