---
uc_id: UC-LA06
nome: "Envio Automatico de Lances — Robo de Lances"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 674
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA06 — Envio Automatico de Lances — Robo de Lances

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 674).
> Sprint origem: **Sprint 9**.

---

**Tipo:** NOVO — componente dentro da sala virtual (UC-LA03)

**RNs aplicadas:** RN-098 (cascata A→E), RN-099, RN-100, RN-106 (perfis), RN-037 (audit), RN-NEW-12 (flag AUTO_BID), RN-NEW-13 (max 20 lances), RN-NEW-14 (lance < custo interrompe)

**RF relacionado:** RF-042 (Robo de Lances)
**Ator:** Sistema (automatico) + Usuario (configura e monitora)

### Pre-condicoes
1. Sala virtual ativa (UC-LA03)
2. Flag `AUTO_BID_ENABLED=true` configurada (RN-NEW-12)
3. Camadas D e E configuradas
4. Perfil competitivo definido

### Pos-condicoes
1. Lances enviados automaticamente dentro dos limites configurados
2. Cada lance automatico gravado em AuditoriaLog com acao=lance_automatico
3. Robo pausado ao atingir limite ou custo

### Sequencia de Eventos

1. Na sala virtual (UC-LA03), [Card: "Robo de Lances"] exibe:
   - [Toggle: "Ativar Robo"] — desabilitado se AUTO_BID_ENABLED=false
   - Se desabilitado globalmente: [Banner: "Envio automatico desabilitado neste ambiente. Ative AUTO_BID_ENABLED no servidor."]
2. Ao ativar o robo, [Modal: "Configurar Robo de Lances"] exibe valores JA CONFIGURADOS na Sprint 3:
   - [Label: "Custo Base (Camada A):"] R$ XXX (readonly) — `PrecoCamada.custo_base_final` — alarme de prejuizo
   - [Label: "Lance Inicial (Camada D):"] R$ XXX (readonly) — `PrecoCamada.lance_inicial` — valor de entrada
   - [Label: "Lance Minimo (Camada E):"] R$ XXX (readonly) — `PrecoCamada.lance_minimo` — freio do robo
   - [Label: "Margem Minima:"] XX.X% (readonly) — `PrecoCamada.margem_minima` — margem no piso
   - [Label: "Perfil:"] [Badge: quero_ganhar] (readonly) — `EstrategiaEdital.perfil_competitivo`
   **Nota:** Os 5 campos acima sao lidos automaticamente das Camadas A/D/E e EstrategiaEdital. O operador NAO precisa redigitar — ele ja configurou na PrecificacaoPage (Sprint 3, UC-P04/P07/P08). Pode editar perfil e limites aqui se quiser ajustar para a sessao.
   - [Select: "Modo de Decremento:"] fixo_reais / percentual_ultimo — UNICO campo novo
   - [NumberInput: "Valor do Decremento:"] (R$ ou %) — UNICO campo novo
   - [NumberInput: "Max lances automaticos:"] (default: 20, max: 20, RN-NEW-13)
   - [Checkbox: "Confirmar cada lance antes de enviar"] (recomendado no primeiro uso — Nivel 2 do roadmap)
3. [Botao: "Iniciar Robo"] ativa o envio automatico
4. Logica do robo em cada ciclo de polling (todas as verificacoes usam Camadas da Sprint 3):
   a. Verifica se estamos em 1a posicao → se sim, nao age
   b. Se perdemos lideranca: calcula proximo lance conforme perfil (EstrategiaEdital.perfil_competitivo):
      - `quero_ganhar` (RN-106): lance = lance_lider - decremento (agressivo, objetivo 1o lugar)
      - `nao_ganhei_minimo` (RN-106): lance = lance_lider - decremento_minimo (conservador, posicao 2a/3a)
   c. Cascata de verificacao de limites (3 niveis, do mais restritivo ao mais grave):
      - **NIVEL 1 — FREIO (Camada E):** Se proximo_lance < `PrecoCamada.lance_minimo`:
        → **PARA** → [Banner amarelo: "Limite minimo atingido (Camada E = R$ XXX, margem XX.X%)"]
        → Operador pode: aceitar posicao OU intervir manualmente OU alterar lance_minimo
      - **NIVEL 2 — ALARME (Camada A):** Se proximo_lance < `PrecoCamada.custo_base_final`:
        → **PARA** → [Banner vermelho: "LANCE ABAIXO DO CUSTO! Prejuizo de R$ XXX"] (RN-100, RN-NEW-14)
        → Exige confirmacao manual explicita (nao pode ser automatico)
      - **NIVEL 3 — TRAVA:** Se lances_enviados >= max_lances (20):
        → **PARA** → [Banner: "Limite de 20 lances automaticos atingido"] (RN-NEW-13)
   d. Se "confirmar cada lance" ativo (Nivel 2 do roadmap): exibe [Popup: "Enviar R$ XXX? Margem: XX.X%"] com [Aceitar/Rejeitar]
   e. Se sem confirmacao ou confirmado: envia lance (Nivel 1 = operador digita no portal / Nivel 3 = API direta)
   f. Grava em AuditoriaLog: `{acao: "lance_automatico", valor, margem, camada_e_limite, rodada, timestamp, usuario}`
   g. Registra Lance no modelo: `Lance(tipo=decremento, valor_lance=X, margem_sobre_custo=Y, status=enviado)`
5. [Card: "Status do Robo"] na sala virtual exibe em tempo real:
   - Status: ATIVO / PAUSADO / PARADO (limite)
   - Lances automaticos enviados: X/20
   - Ultimo lance automatico: R$ XXX as HH:MM:SS
   - Margem corrente: XX.X%
6. [Botao: "Pausar"] — interrompe robo sem desconfigurar (retoma com [Botao: "Retomar"])
7. [Botao: "Parar"] — desativa robo completamente
8. Ao encerrar sessao: robo para automaticamente
9. [Relatorio pos-sessao] (no modal de resultado UC-LA03):
   - Total de lances automaticos: X
   - Total de lances manuais: X
   - Economia de tempo estimada: Xmin (baseado em tempo medio de decisao manual)

### Tela(s) Representativa(s)

**Pagina:** LancesPage (`/app/lances`) — dentro da sala virtual
**Posicao:** Card inferior direito

#### Layout do Card do Robo

```
+--- Robo de Lances ---+
| [Toggle: ATIVO]       |
|                       |
| Modo: fixo_reais      |
| Decremento: R$ 5,00   |
| Perfil: quero_ganhar   |
| Confirmacao: NAO       |
|                       |
| Lances auto: 7/20     |
| Ultimo: R$ 412,50     |
|   as 14:23:15          |
| Margem: 18.2%         |
|                       |
| [Pausar] [Parar]      |
+-----------------------+
```

### Excecoes
- **E1:** AUTO_BID_ENABLED=false — toggle desabilitado com tooltip explicativo
- **E2:** Lance automatico falha (timeout, erro de rede) — robo pausa e notifica usuario
- **E3:** Concorrente envia lance muito abaixo (suspeita de erro) — robo pausa e exibe: "Lance anomalo detectado. Verifique antes de continuar."

---

# FASE 2 — INDICADORES AVANCADOS

---
