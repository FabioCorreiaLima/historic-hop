/// <reference types="https://deno.land/x/types/index.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { periodId, level, topic, difficulty } = await req.json();
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN não configurada");

    const periodNames: Record<string, string> = {
      colonia: "Brasil Colônia",
      imperio: "Império do Brasil",
      republica_velha: "República Velha",
      era_vargas: "Era Vargas",
      ditadura: "Ditadura Militar",
      nova_republica: "Nova República"
    };

    const periodName = periodNames[periodId] || "História do Brasil";

    const systemPrompt = `Você é um especialista em história brasileira. Sua tarefa é gerar perguntas de quiz sobre ${periodName}.

REGRAS IMPORTANTES:
- Gere perguntas históricas precisas e educacionais
- Cada pergunta deve ter 4 opções (A, B, C, D)
- Apenas uma opção deve estar correta
- Forneça uma explicação detalhada para a resposta correta
- As perguntas devem ser do nível ${level} e dificuldade ${difficulty || "médio"}
- Responda APENAS com um JSON válido no formato:
{
  "question": "Pergunta aqui?",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correct_index": 0,
  "explanation": "Explicação detalhada aqui"
}`;

    const userPrompt = topic
      ? `Gere uma pergunta sobre: ${topic}`
      : `Gere uma pergunta interessante sobre ${periodName}`;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3f56",
        input: {
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Replicate API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.output?.join('') || '';

    if (!content) {
      return new Response(JSON.stringify({ error: "Resposta vazia da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to parse the JSON response
    try {
      const questionData = JSON.parse(content);
      return new Response(JSON.stringify(questionData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(JSON.stringify({ error: "Resposta da IA não é um JSON válido" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});