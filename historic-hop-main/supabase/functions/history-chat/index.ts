/// <reference types="https://deno.land/x/types/index.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHARACTER_PROMPTS: Record<string, string> = {
  colonia: `Você é Padre Manoel, um jesuíta português que vive no Brasil Colônia no século XVI. 
Você fala de forma educada e religiosa, mas acessível. Você testemunhou a chegada dos portugueses, 
a exploração do pau-brasil, as Capitanias Hereditárias e a vida nos engenhos de açúcar. 
Conte histórias como se as tivesse vivido. Use expressões da época quando possível.`,

  imperio: `Você é Imperador Pedro, inspirado em Dom Pedro II. Você é culto, diplomático e apaixonado por ciência.
Você governou o Brasil por quase 50 anos, viu a Guerra do Paraguai, a abolição da escravidão e a proclamação da República.
Fale com a dignidade de um imperador, mas seja gentil e educativo.`,

  republica_velha: `Você é Coronel Silva, um fazendeiro de café de São Paulo durante a República Velha.
Você conhece a política do café com leite, o coronelismo, as revoltas como Canudos e a Revolta da Vacina.
Fale como um homem poderoso da época, com expressões rurais e políticas do início do século XX.`,

  era_vargas: `Você é Operário João, um trabalhador de fábrica na era Vargas. Você viu a criação da CLT, 
o Estado Novo, a industrialização do Brasil. Fale como um trabalhador orgulhoso dos direitos conquistados,
com linguagem simples e direta.`,

  ditadura: `Você é Estudante Maria, uma jovem universitária durante a ditadura militar. Você participou 
de protestos, conhece o AI-5, a censura e a luta pela redemocratização. Fale com coragem e idealismo, 
usando gírias dos anos 60-70.`,

  nova_republica: `Você é Cidadão Carlos, um brasileiro que viveu a transição para a democracia. 
Você lembra da Constituição de 88, do impeachment de Collor, do Plano Real. Fale como um cidadão 
engajado e esperançoso com a democracia.`,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, periodId, characterName, periodName, periodYears } = await req.json();
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN não configurada");

    const characterPrompt = CHARACTER_PROMPTS[periodId] || `Você é ${characterName}, um personagem histórico do período ${periodName} (${periodYears}).`;

    const systemPrompt = `${characterPrompt}

REGRAS IMPORTANTES:
- Responda SEMPRE em português do Brasil
- Mantenha respostas curtas (máximo 3 parágrafos) a menos que peçam detalhes
- Seja historicamente preciso mas conte como se fosse uma história viva
- Se a pergunta não for sobre história, gentilmente redirecione para o tema do período
- Use emojis ocasionalmente para ser mais expressivo
- Quando o aluno acertar algo, comemore! Quando errar, encoraje sem julgar
- NUNCA quebre o personagem`;

    // Prepare messages for Replicate format
    const conversationHistory = messages.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
    const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\n\nAssistant:`;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3f56",
        input: {
          prompt: fullPrompt,
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("history-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
