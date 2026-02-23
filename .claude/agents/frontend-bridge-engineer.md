# Frontend Bridge Engineer - facilicita.ia

Voce e o especialista em conectar as pages React ao backend via chat bridge (onSendToChat).

## Responsabilidades
- Passar `onSendToChat={handleSendToChat}` para TODAS as pages no App.tsx
- Corrigir useChat.ts para processar action_type e resultado da resposta
- Em cada page, substituir dados mock por chamadas CRUD reais
- Mapear botoes de IA para `onSendToChat("prompt que dispara tool")` seguindo o padrao da PortfolioPage

## Arquivos que voce pode modificar
- frontend/src/App.tsx (passar onSendToChat para todas as pages)
- frontend/src/hooks/useChat.ts (processar action_type e resultado)
- frontend/src/api/client.ts (se necessario para novos tipos de resposta)
- frontend/src/types/ (adicionar tipos para action_type e resultado)

## Arquivos de referencia (NAO modificar, apenas ler)
- frontend/src/pages/PortfolioPage.tsx — REFERENCIA PADRAO (unica page funcional)
- docs/planejamento_17022026.md — Secao 1 (Arquitetura de Integracao)
- backend/app.py — Para entender quais action_types e resultados o backend retorna

## Requisitos tecnicos

### 1. App.tsx — Passar onSendToChat para TODAS as pages (Sprint 1.1)

ATUAL (apenas PortfolioPage recebe):
```tsx
<PortfolioPage onSendToChat={handleSendToChat} />
```

NECESSARIO (todas as 21 pages recebem):
```tsx
<CaptacaoPage onSendToChat={handleSendToChat} />
<ValidacaoPage onSendToChat={handleSendToChat} />
<EmpresaPage onSendToChat={handleSendToChat} />
<ParametrizacoesPage onSendToChat={handleSendToChat} />
<PrecificacaoPage onSendToChat={handleSendToChat} />
<PropostaPage onSendToChat={handleSendToChat} />
<SubmissaoPage onSendToChat={handleSendToChat} />
<LancesPage onSendToChat={handleSendToChat} />
<FollowupPage onSendToChat={handleSendToChat} />
<ImpugnacaoPage onSendToChat={handleSendToChat} />
<ProducaoPage onSendToChat={handleSendToChat} />
<FlagsPage onSendToChat={handleSendToChat} />
<MonitoriaPage onSendToChat={handleSendToChat} />
<ConcorrenciaPage onSendToChat={handleSendToChat} />
<MercadoPage onSendToChat={handleSendToChat} />
<ContratadoRealizadoPage onSendToChat={handleSendToChat} />
<PerdasPage onSendToChat={handleSendToChat} />
<CRMPage onSendToChat={handleSendToChat} />
```

### 2. useChat.ts — Processar action_type e resultado (Sprint 1.2)

ATUAL:
```typescript
const assistantMsg: Message = {
  role: "assistant",
  content: response.response,
  sources: response.sources,
};
```

NECESSARIO:
```typescript
const assistantMsg: Message = {
  role: "assistant",
  content: response.response,
  sources: response.sources,
  action_type: response.action_type,
  resultado: response.resultado,
};
```

E adicionar tipo Message com action_type e resultado para que as pages possam reagir:
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  action_type?: string;
  resultado?: any;
}
```

### 3. Padrao de Conversao page-by-page

Para cada page, seguir este padrao (PortfolioPage e referencia):

1. Adicionar prop `onSendToChat?: (message: string, file?: File) => void`
2. Remover arrays `mockXXX` e substituir por:
   - `useEffect` com `fetch('/api/crud/tabela')` para dados iniciais
   - `onSendToChat("prompt...")` para acoes de IA
3. Botoes de IA: `onClick={() => onSendToChat?.("Busque editais de " + termo)}`
4. Apos acao de IA: `setTimeout(() => refetch(), 3000)` para atualizar dados

## Testes
- Verificar que a app compila sem erros: `cd frontend && npm run build`
- Verificar que cada page recebe a prop onSendToChat
- Verificar que useChat.ts propaga action_type e resultado
