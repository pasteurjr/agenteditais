# Análise Crítica de UI/UX - "CARA SISTEMA.pdf"

**Data**: 2026-02-10
**Analista**: Designer UI/UX
**Documento Analisado**: CARA SISTEMA.pdf

---

## 1. PROBLEMAS DE ARQUITETURA DA INFORMAÇÃO

### Layout com Dois Menus Laterais (Página 1)
**Problema Grave**: O mockup mostra menus laterais em ambos os lados da tela (Fluxo Comercial à esquerda, Indicadores à direita). Isso é uma **violação básica de usabilidade**.

- **Inconsistência de navegação**: O usuário não sabe para onde olhar primeiro
- **Fadiga visual**: Força o olho a percorrer extremidades opostas constantemente
- **Incompatível com responsividade**: Em telas menores, dois sidebars são inviáveis
- **Quebra de padrão mental**: Usuários esperam navegação primária à esquerda

**Recomendação**: Unificar toda navegação em um único sidebar à esquerda, com seções expansíveis.

### Menu Superior Flutuante (Empresa, Portfolio, Parametrizações)
**Problema**: Separar configurações em um menu superior desconectado do fluxo principal cria confusão sobre hierarquia.

- Usuário precisa decorar que "configurações estão em cima" e "operações estão nas laterais"
- O ícone "F1" ao lado de cada item sugere ajuda contextual, mas não fica claro se é clicável ou apenas indicativo

**Recomendação**: Integrar Empresa, Portfolio e Parametrizações como uma seção "Configurações" no sidebar único.

---

## 2. PROBLEMAS DE DENSIDADE INFORMACIONAL

### Tela de Validação (Páginas 7-8)
Esta é a tela mais crítica e apresenta **sobrecarga cognitiva severa**.

**Elementos simultâneos na mesma tela:**
- Score numérico grande (82/100)
- 6 barras de aderência diferentes (Técnica, Documental, Jurídica, Portfolio, Logística, Comercial)
- Painel "Sinais de Mercado" com ícones de concorrente/suspeita
- Checklist de documentos
- Mapa logístico
- Histórico semelhante
- Campo "Pergunte à IA"
- Resumo da IA
- Análise de lote com "Item Intruso"
- Alerta de recorrência
- Informações do órgão (reputação)
- Checklist documental
- Flags jurídicos

**Problemas específicos:**
1. **Hierarquia visual inexistente**: Tudo compete por atenção igualmente
2. **Duplicação de informação**: O score 82 aparece em círculo grande E como barra gráfica
3. **Inconsistência de visualização**: Algumas métricas usam percentual (90%), outras usam texto (High/Medium/Low), outras usam estrelas (4.5/5)
4. **Excesso de cores de alerta**: Vermelho, laranja, amarelo e verde aparecem simultaneamente, diluindo a urgência

**Recomendação**:
- Criar visualização progressiva (progressive disclosure): mostrar score principal primeiro, detalhes sob demanda
- Usar abas ou cards expansíveis para separar: Análise Técnica | Análise Documental | Análise Comercial | Riscos
- Padronizar sistema de scores (sempre percentual OU sempre High/Medium/Low, não ambos)

---

## 3. PROBLEMAS DE CONSISTÊNCIA VISUAL

### Sistema de Scores Fragmentado (Página 5)
O documento define múltiplos scores sem unificação visual:

| Score | Visualização | Problema |
|-------|-------------|----------|
| Score de Aderência | Percentual em círculo (98%) | OK |
| Score de Aderência Técnica | Percentual em gauge (90%) | Diferente do anterior |
| Score de Aderência Comercial | Percentual em gauge (75%) | OK |
| Score de Recomendação | Estrelas (4.5/5) | Escala totalmente diferente |
| Potencial de Ganho | Texto "Elevado" | Sem valor numérico |
| Expectativa de Margem | Slider sem número | Impossível comparar |

**Problema**: O usuário não consegue comparar oportunidades rapidamente porque cada métrica usa escala diferente.

**Recomendação**: Definir um único sistema:
- Todos os scores em percentual (0-100%)
- Usar cores consistentes: Verde >80%, Amarelo 50-80%, Vermelho <50%
- Substituir estrelas e texto por percentuais

---

## 4. PROBLEMAS DE FLUXO DE TRABALHO

### Ausência de Estados e Transições
O documento não define:
- Como um edital passa de "Captação" para "Validação"
- Onde o usuário clica para avançar no funil
- Como desfazer uma ação (ex: marcou "Ignorar" por engano)

### Botões de Ação Mal Posicionados (Página 7)
Os botões `[Participar]`, `[Acompanhar]`, `[Ignorar]` aparecem no meio de informações analíticas. O usuário precisa:
1. Ler todos os dados
2. Procurar onde estão os botões
3. Depois voltar a ler para decidir

**Recomendação**: Botões de ação primária sempre no mesmo lugar (rodapé fixo ou barra lateral direita fixa).

---

## 5. PROBLEMAS DE INTERAÇÃO COM IA

### Campo "Pergunte à IA" Subvalorizado
Na tela de validação, o campo de perguntas aparece como um pequeno input no canto, competindo com dezenas de outros elementos.

**Problemas:**
- Não fica claro o que a IA pode responder
- Sem sugestões de perguntas
- Histórico de perguntas não visível
- Conflito com o chat flutuante (Dr. Licita)

**Recomendação**: Definir claramente:
- Chat flutuante = perguntas gerais sobre o sistema
- Botão contextual "Analisar com IA" = análise específica daquele edital
- Não duplicar interfaces de IA na mesma tela

---

## 6. PROBLEMAS DE CADASTRO E CONFIGURAÇÃO

### Tela de Portfolio (Página 3)
**Positivo**: A ideia de "IA preenche automaticamente" é excelente.

**Problemas:**
- Formulário muito genérico (Nome, Classe, Especificação 1, Potência, Voltagem)
- Não fica claro quais campos são obrigatórios
- Sem validação visual de completude
- O ícone de "Manual Técnico.pdf" anexado não indica se foi processado pela IA

**Recomendação**:
- Mostrar barra de progresso de completude do cadastro
- Indicar visualmente campos preenchidos pela IA vs. pelo usuário
- Permitir aprovação/rejeição de sugestões da IA

### Tela de Parametrizações (Página 4)
**Problema crítico**: Mistura conceitos diferentes na mesma tela:
- Classificação de produtos (Produtos)
- Configurações comerciais (Comerciais)
- Mercado endereçável (TAM/SAM/SOM)

**Recomendação**: Separar em sub-abas:
- Produtos → Classificação e NCMs
- Comercial → Região, prazo de entrega
- Mercado → TAM/SAM/SOM (isso é análise estratégica, não parametrização)

---

## 7. PROBLEMAS DE RESPONSIVIDADE E ACESSIBILIDADE

### Não Abordados no Documento
- Como a interface se comporta em tablet/mobile?
- Tamanho mínimo de fonte para scores?
- Contraste de cores em texto sobre fundos coloridos?
- Navegação por teclado?

---

## 8. RESUMO DE RECOMENDAÇÕES PRIORITÁRIAS

| Prioridade | Problema | Solução |
|------------|----------|---------|
| **CRÍTICO** | Dois sidebars laterais | Unificar em sidebar único à esquerda |
| **CRÍTICO** | Sobrecarga na tela de Validação | Usar abas/progressive disclosure |
| **ALTA** | Sistema de scores inconsistente | Padronizar em percentual 0-100% |
| **ALTA** | Botões de ação mal posicionados | Barra de ações fixa no rodapé |
| **MÉDIA** | Duplicação de interface de IA | Chat flutuante OU contextual, não ambos |
| **MÉDIA** | Falta de estados de transição | Definir workflow claro Captação→Validação→Proposta |
| **BAIXA** | Métricas TAM/SAM/SOM em Parametrizações | Mover para seção de Mercado/Indicadores |

---

## 9. CONCLUSÃO

O documento demonstra **boa compreensão do domínio de negócio** (licitações, scores, riscos), mas a proposta de UI apresenta problemas estruturais que comprometeriam severamente a usabilidade em produção. A tentativa de mostrar "tudo de uma vez" para impressionar o usuário resultaria no efeito oposto: confusão e abandono.

A implementação atual (sidebar único, chat flutuante independente, páginas separadas por função) está no caminho correto. As próximas telas devem seguir o princípio de **simplicidade progressiva**: mostrar o essencial primeiro, detalhes sob demanda.

---

## 10. PRÓXIMOS PASSOS SUGERIDOS

1. **Revisar o plano de implementação** considerando estas críticas
2. **Prototipar a tela de Validação** com abas em vez de tudo visível
3. **Definir guia de estilos** para scores (cores, formatos, escalas)
4. **Testar com usuários reais** antes de implementar todas as telas
5. **Documentar fluxos de transição** entre estados dos editais
