/// <reference types="https://deno.land/x/types/index.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERIOD_PROMPTS = {
  colonia: "Você é um especialista em História do Brasil Colonial (1500-1822). Gere atividades sobre: chegada dos portugueses, escravidão africana, ciclos econômicos, capitanias, governo-geral, revoltas, quilombos.",
  imperio: "Você é um especialista em História do Império do Brasil (1822-1889). Gere atividades sobre: Independência, D. Pedro I e II, guerras, abolição, imigração.",
  republica_velha: "Você é um especialista em História da República Velha (1889-1930). Gere atividades sobre: Proclamação da República, café com leite, coronelismo, revoltas.",
  era_vargas: "Você é um especialista em História da Era Vargas (1930-1945). Gere atividades sobre: Revolução de 1930, Estado Novo, CLT, industrialização.",
  ditadura: "Você é um especialista em História da Ditadura Militar (1964-1985). Gere atividades sobre: golpe de 1964, AI-5, repressão, resistência, redemocratização.",
  nova_republica: "Você é um especialista em História da Nova República (1985-presente). Gere atividades sobre: Constituição de 1988, Plano Real, presidentes, democracia."
};

serve(async (req: Request) => {
  // 1. Responde rapidamente ao preflight CORS
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { periodId, activityType, level = 1, difficulty = "Fácil" } = await req.json();
    if (!periodId || !activityType) throw new Error("periodId e activityType são obrigatórios");

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN não configurada");

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    const periodPrompt = PERIOD_PROMPTS[periodId as keyof typeof PERIOD_PROMPTS] || "Especialista em História do Brasil.";

    let activityPrompt = "";
    if (activityType === "quiz") {
      activityPrompt = `Gere UMA pergunta de múltipla escolha. Formato JSON: {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "...", "imagePrompt": "Cena histórica realista em inglês..."}`;
    } else if (activityType === "chronological") {
      activityPrompt = `Gere UMA atividade de ordenação. Formato JSON: {"instruction": "...", "events": [{"text": "...", "year": 1500}], "explanation": "...", "imagePrompt": "Cena histórica realista em inglês..."}`;
    } else if (activityType === "true_false") {
      activityPrompt = `Gere UMA afirmação. Formato JSON: {"statement": "...", "isTrue": true, "explanation": "...", "imagePrompt": "Cena histórica realista em inglês..."}`;
    } else if (activityType === "fill_blank") {
      activityPrompt = `Gere lacunas. Formato JSON: {"textWithBlanks": "... __BLANK__ ...", "blanks": ["..."], "options": ["..."], "explanation": "...", "imagePrompt": "Cena histórica realista em inglês..."}`;
    }

    const systemPrompt = `${periodPrompt} RESPONDA APENAS COM UM JSON VÁLIDO. Nível: ${level}, Dificuldade: ${difficulty}. Para imagePrompt, escreva em INGLÊS para o gerador de imagens.`;

    // 1. Gerar Texto com Llama 3 no Replicate
    const textOutput = await replicate.run("meta/meta-llama-3-70b-instruct", {
      input: {
        prompt: `${systemPrompt}\n\n${activityPrompt}\n\nJSON:`,
        max_tokens: 1000,
      }
    });

    const content = (textOutput as string[]).join('');
    
    // Extrair JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("A IA não retornou um JSON válido.");
    const activityData = JSON.parse(jsonMatch[0]);

    // 2. Gerar Imagem com SDXL no Replicate
    let imageUrl = null;
    if (activityData.imagePrompt) {
      try {
        const imageOutput = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          { input: { prompt: activityData.imagePrompt, width: 1024, height: 1024 } }
        );
        imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput;
      } catch (e) {
        console.error("Erro na imagem:", e);
      }
    }

    const activity = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: activityType,
      level,
      period: periodId,
      difficulty,
      ...activityData,
      imageUrl,
    };

    return new Response(JSON.stringify(activity), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});