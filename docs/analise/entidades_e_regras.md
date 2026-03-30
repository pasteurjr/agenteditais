# Entidades e Regras de Negócio — Agente de Editais

**Data:** 30/03/2026

---

## Entidades Principais (53 models)

### Núcleo
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| User | users | → Empresa, Edital, Contrato, Proposta, ... |
| Empresa | empresas | → Documentos, Certidões, Responsáveis, Produtos |
| Produto | produtos | → Especificações, Documentos, Área, Classe, Subclasse |

### Editais
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| Edital | editais | → Requisitos, Documentos, Itens, Lotes, Propostas |
| EditalRequisito | editais_requisitos | → Edital |
| EditalDocumento | editais_documentos | → Edital (PDF com texto_extraido) |
| EditalItem | editais_itens | → Edital, EditalItemProduto |

### Precificação
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| Lote | lotes | → Edital, LoteItens |
| EditalItemProduto | edital_item_produto | → EditalItem, Produto, PrecoCamada |
| PrecoCamada | preco_camadas | → EditalItemProduto (camadas A-E) |
| Lance | lances | → EditalItemProduto |

### Propostas
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| Proposta | propostas | → Edital, Produto, Análise, PropostaLog |
| PropostaTemplate | proposta_templates | → Empresa |

### Contratos
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| Contrato | contratos | → Edital, Entregas, Aditivos, Designações |
| ContratoEntrega | contrato_entregas | → Contrato |
| ContratoAditivo | contrato_aditivos | → Contrato |
| ContratoDesignacao | contrato_designacoes | → Contrato, AtividadeFiscal |

### Jurídico
| Entidade | Tabela | Relacionamentos |
|----------|--------|----------------|
| Impugnacao | impugnacoes | → Edital |
| RecursoDetalhado | recursos_detalhados | → Edital |
| ValidacaoLegal | validacoes_legais | → Edital (read-only) |

---

## Regras de Negócio Críticas

### RN-001: Prazo de Impugnação (Art. 164 Lei 14.133)
- Impugnação deve ser registrada até **3 dias úteis** antes da abertura
- Sistema calcula automaticamente e exibe badge (verde/amarelo/vermelho/expirado)

### RN-002: Limites de Aditivo (Art. 124-126 Lei 14.133)
- Acréscimo máximo: **25%** do valor original (geral)
- Acréscimo máximo: **50%** para reformas (Art. 125)
- Barra de progresso visual com alerta em 80% do limite

### RN-003: Designação Gestor/Fiscal (Art. 117 Lei 14.133)
- Obrigatório designar gestor e fiscal para cada contrato
- Mesma pessoa NÃO pode ser gestor e fiscal simultaneamente (§5º)

### RN-004: Limites de Carona ARP (Art. 82-86 Lei 14.133)
- Limite individual: **50%** da quantidade registrada por órgão
- Limite global: **2x** a quantidade registrada total
- Validação server-side no endpoint POST de caronas

### RN-005: Score de Aderência
- 6 dimensões: técnico (30%), documental (25%), complexidade (15%), jurídico (10%), logístico (10%), comercial (10%)
- Score geral: média ponderada 0-100
- Recomendação: ≥70 PARTICIPAR, 40-69 AVALIAR, <40 NÃO PARTICIPAR

### RN-006: Score Logístico
- 4 dimensões: distância (30%), histórico entregas (25%), custo frete (25%), prazo (20%)
- Recomendação: ≥70 VIÁVEL, 40-69 PARCIAL, <40 INVIÁVEL

### RN-007: Status de Edital
- Enum: novo, analisando, participando, proposta_enviada, em_pregao, vencedor, perdedor, cancelado, desistido, ganho, perdido, temp_score

### RN-008: Status de Proposta
- Fluxo: rascunho → revisão → aprovada → enviada
- Log de todas as alterações (PropostaLog)

### RN-009: Status de Contrato
- Enum: vigente, encerrado, rescindido, suspenso
- Recalculado automaticamente baseado em entregas atrasadas

### RN-010: Alertas Multi-tier
- 30 dias: notificação in-app
- 15 dias: + email
- 7 dias: todos os canais
- 1 dia: banner crítico
- Tipos: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo
