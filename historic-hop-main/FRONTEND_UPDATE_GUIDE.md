# Frontend - Atualizar para apontar para Backend Express

Após criar e rodar o backend em `http://localhost:3001`, você precisa atualizar os arquivos do frontend que fazem chamadas de API.

## 1. Atualizar `src/data/activities.ts`

**Antes:**
```typescript
const GENERATE_ACTIVITY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-activity`;
```

**Depois:**
```typescript
const GENERATE_ACTIVITY_URL = "http://localhost:3001/api/generate-activity";
```

Remove a necessidade de autorização via `VITE_SUPABASE_PUBLISHABLE_KEY` - o backend Express não precisa disso.

---

## 2. Função `generateActivity()` em `src/data/activities.ts`

**Antes:**
```typescript
const response = await fetch(GENERATE_ACTIVITY_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  body: JSON.stringify({...})
});
```

**Depois:**
```typescript
const response = await fetch(GENERATE_ACTIVITY_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({...})
});
```

---

## 3. Atualizar endpoints de imagens em `src/data/activities.ts`

**Antes:**
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
```

**Depois:**
```typescript
// As imagens agora são geradas pelo backend automaticamente
// Não é necessário fazer requisição adicional
```

---

## 4. Remover variáveis desnecessárias do `.env`

Seu `.env` pode agora ser simplificado para:

```
VITE_SUPABASE_URL=https://mqagxiruwgytlwodahfv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_T0tp5rX5di9YEJl_4arQBA_2HhERwLp

# Opcional - se ainda usar Supabase para dados
```

---

## 5. Arquivo completo atualizado para `src/data/activities.ts`

```typescript
import { supabase } from "@/integrations/supabase/client";

// ... imports e tipos ...

const GENERATE_ACTIVITY_URL = "http://localhost:3001/api/generate-activity";
const GENERATE_QUESTIONS_URL = "http://localhost:3001/api/generate-questions";
const HISTORY_CHAT_URL = "http://localhost:3001/api/history-chat";

export async function generateActivity(
  periodId: string,
  activityType: ActivityType,
  level: number = 1,
  difficulty: "Fácil" | "Médio" | "Avançado" = "Fácil"
): Promise<Activity | null> {
  try {
    const response = await fetch(GENERATE_ACTIVITY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        periodId,
        activityType,
        level,
        difficulty,
      }),
    });

    if (!response.ok) {
      console.error("Erro ao gerar atividade:", response.status);
      return null;
    }

    const activity = await response.json();
    return activity as Activity;
  } catch (error) {
    console.error("Erro na geração de atividade:", error);
    return null;
  }
}
```

---

## 6. Outras mudanças necessárias

- Não remova o Supabase client (`src/integrations/supabase/client.ts`) se estiver usando para dados
- Mantenha autenticação com Supabase se necessário
- O backend Express não gerencia autenticação - isso fica com Supabase

---

## 7. Testando

1. Inicie o backend:
```bash
cd historic-hop-backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd historic-hop-main
npm run dev
```

3. Teste uma atividade no aplicativo - deve chamar o backend Express agora

---

## Próximos passos

- [ ] Implementar autenticação JWT opcional no backend
- [ ] Conectar Supabase para persistência de dados
- [ ] Deploy do backend (Heroku, Railway, Vercel)
- [ ] Deploy do frontend (Vercel, Netlify)
