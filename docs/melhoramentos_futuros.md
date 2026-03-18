# Melhoramentos Futuros

**Data:** 18/03/2026
**Projeto:** Agente de Editais

---

## 1. Modelo LLM configuravel via banco (ParametroScore)

**Problema atual:** O modelo usado nas chamadas LLM para score rapido e profundo esta hardcoded como `deepseek-chat` em cada chamada no `backend/tools.py` (parametro `model_override="deepseek-chat"`). Para trocar o modelo e necessario editar codigo e reiniciar o backend.

**Impacto observado:** O `deepseek-chat` e um modelo rapido e barato, mas nao tem granularidade tecnica suficiente para diferenciar subtipos de produto com precisao. Exemplos reais observados:
- Microscopio Binocular (produto) vs Microscopio Estereoscopico Trinocular com Zoom (edital) — IA deu 95% tecnico, deveria ser ~50%
- Reinstalacao de analisador bioquimico (servico) interpretado como aquisicao de equipamento — IA deu 85% tecnico

**Solucao proposta:** Adicionar 2 campos na tabela `parametros_score`:
- `modelo_score_rapido` (VARCHAR, default "deepseek-chat") — modelo para score batch/rapido
- `modelo_score_profundo` (VARCHAR, default "deepseek-chat") — modelo para score profundo (6 dimensoes)

**Implementacao:**
1. `backend/models.py` — Adicionar os 2 campos na classe `ParametroScore`
2. `backend/tools.py` — Substituir `model_override="deepseek-chat"` por leitura do parametro do banco:
   - `tool_calcular_score_aderencia()` (score rapido, linha ~3619) → usa `params.modelo_score_rapido`
   - `tool_calcular_scores_validacao()` (score profundo, linha ~7943) → usa `params.modelo_score_profundo`
3. `frontend/src/pages/ParametrizacoesPage.tsx` — Adicionar 2 selects na aba Score com opcoes de modelo:
   - `deepseek-chat` (rapido, barato, bom para triagem)
   - `deepseek-reasoner` (lento, mais caro, melhor raciocinio)
   - Futuro: `claude-sonnet`, `gpt-4o`, etc.

**Beneficio:** Trocar o modelo sem reiniciar, sem editar codigo. Permite testar modelos diferentes para rapido (alto volume, preco importa) vs profundo (poucos editais, precisao importa).

**Estimativa de esforco:** Baixo (1-2h). Migracao de banco + 2 edits no backend + 1 componente no frontend.

---
