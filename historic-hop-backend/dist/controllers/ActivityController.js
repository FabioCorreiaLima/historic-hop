import { AIService } from '../services/AIService.js';
import { prisma } from '../config/database.js';
const PERIOD_PROMPTS = {
    colonia: `Você é um especialista em História do Brasil Colonial (1500-1822).
Gere atividades educativas sobre: chegada dos portugueses, escravidão africana, ciclos econômicos (pau-brasil, açúcar, ouro), capitanias hereditárias, governo-geral, revoltas coloniais, quilombos, sociedade colonial.

Para mapas: mostre rotas de exploração, capitanias, quilombos, engenhos de açúcar.
Para imagens: cenas históricas realistas da época colonial.
Para áudio: narração em português antigo ou com sotaque da época.`,
    imperio: `Você é um especialista em História do Império do Brasil (1822-1889).
Gere atividades educativas sobre: Independência, D. Pedro I e II, guerras (Cisplatina, Paraguai), abolição da escravidão, imigração, industrialização inicial, política imperial.

Para mapas: fronteiras do império, rotas de guerra, imigração europeia.
Para imagens: retratos imperiais, batalhas, vida urbana no século XIX.
Para áudio: narração com tom imperial, formal.`,
    republica_velha: `Você é um especialista em História da República Velha (1889-1930).
Gere atividades educativas sobre: Proclamação da República, política do café com leite, coronelismo, revoltas (Canudos, Vacina), tenentismo, imigração em massa, urbanização.

Para mapas: divisão política, zonas de produção de café, revoltas.
Para imagens: políticos da república, revoltas populares, imigrantes.
Para áudio: narração com sotaque rural brasileiro.`,
    era_vargas: `Você é um especialista em História da Era Vargas (1930-1945).
Gere atividades educativas sobre: Revolução de 1930, Estado Novo, CLT, industrialização, populismo, cultura, educação, saúde pública.

Para mapas: industrialização, migração urbana, influência política.
Para imagens: fábricas, manifestações populares, retratos oficiais.
Para áudio: narração com tom trabalhista, operário.`,
    ditadura: `Você é um especialista em História da Ditadura Militar (1964-1985).
Gere atividades educativas sobre: golpe de 1964, AI-5, repressão, resistência, guerrilha, exílio, abertura política, redemocratização.

Para mapas: centros de repressão, movimentos guerrilheiros, exílio.
Para imagens: manifestações, repressão, resistência popular.
Para áudio: narração com tom de resistência, anos 70.`,
    nova_republica: `Você é um especialista em História da Nova República (1985-presente).
Gere atividades educativas sobre: Constituição de 1988, Plano Real, impeachment de Collor, governos Lula/FHC, crescimento econômico, desigualdade social, democracia.

Para mapas: desenvolvimento regional, desigualdade social, eleições.
Para imagens: manifestações democráticas, economia moderna, diversidade social.
Para áudio: narração contemporânea, democrática.`
};
const CHARACTER_AVATARS = {
    colonia: "Padre jesuíta português do século XVI, com batina, barba branca, expressão sábia e bondosa",
    imperio: "Imperador Dom Pedro II, homem de meia-idade, barba branca, uniforme imperial, expressão digna",
    republica_velha: "Coronel fazendeiro de café, homem forte, chapéu de palha, roupa elegante rural",
    era_vargas: "Trabalhador industrial, jovem, roupa de operário, expressão determinada e orgulhosa",
    ditadura: "Estudante universitária jovem, cabelos longos, expressão corajosa e idealista",
    nova_republica: "Cidadão brasileiro moderno, expressão esperançosa e engajada"
};
export class ActivityController {
    static async generateActivity(req, res) {
        try {
            const { periodId, activityType, level = 1, difficulty = "Fácil", includeAudio = false, includeVideo = false, includeMap = true, includeAvatar = false } = req.body;
            if (!periodId || !activityType) {
                return res.status(400).json({ error: "periodId e activityType são obrigatórios" });
            }
            const periodPrompt = PERIOD_PROMPTS[periodId] || "Especialista em História do Brasil.";
            let activityPrompt = "";
            let mapPrompt = "";
            let audioPrompt = "";
            let videoPrompt = "";
            let avatarPrompt = "";
            if (activityType === "quiz") {
                activityPrompt = `Gere UMA pergunta de múltipla escolha histórica precisa. Formato JSON:
{
  "question": "Pergunta clara e objetiva sobre ${periodId}",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctIndex": 0,
  "explanation": "Explicação detalhada histórica",
  "imagePrompt": "Cena histórica realista detalhada em português",
  "mapPrompt": "Descrição de mapa histórico mostrando elementos geográficos e políticos",
  "audioPrompt": "Texto para narração em português brasileiro",
  "videoPrompt": "Descrição de cena histórica animada ou documentário curto"
}`;
                mapPrompt = `Crie um mapa histórico detalhado de ${periodId} mostrando: fronteiras, cidades importantes, rotas comerciais, conflitos, migrações. Descreva em detalhes para geração de imagem.`;
                audioPrompt = `Texto narrativo em português brasileiro sobre esta pergunta histórica, com tom educativo e envolvente.`;
                videoPrompt = `Cena histórica animada mostrando o contexto desta pergunta, com narração explicativa.`;
            }
            else if (activityType === "chronological") {
                activityPrompt = `Gere UMA atividade de ordenação cronológica com 5 eventos históricos. Formato JSON:
{
  "instruction": "Ordene cronologicamente estes eventos históricos",
  "events": [
    {"text": "Evento 1", "year": 1500, "description": "Descrição detalhada"},
    {"text": "Evento 2", "year": 1600, "description": "Descrição detalhada"}
  ],
  "explanation": "Explicação sobre a importância cronológica",
  "imagePrompt": "Linha do tempo visual histórica",
  "mapPrompt": "Mapa mostrando evolução territorial ao longo do tempo",
  "audioPrompt": "Narração cronológica dos eventos",
  "videoPrompt": "Animação da linha do tempo histórica"
}`;
            }
            else if (activityType === "true_false") {
                activityPrompt = `Gere UMA afirmação verdadeiro/falso histórica precisa. Formato JSON:
{
  "statement": "Afirmação histórica que pode ser verdadeira ou falsa",
  "isTrue": true,
  "explanation": "Explicação histórica detalhada",
  "imagePrompt": "Imagem que ilustra a afirmação histórica",
  "mapPrompt": "Mapa mostrando contexto geográfico da afirmação",
  "audioPrompt": "Explicação narrativa da afirmação",
  "videoPrompt": "Cena histórica ilustrando a afirmação"
}`;
            }
            else if (activityType === "fill_blank") {
                activityPrompt = `Gere UMA atividade de preenchimento de lacunas com 3 lacunas. Formato JSON:
{
  "textWithBlanks": "Texto histórico com __BLANK__ como placeholders",
  "blanks": ["palavra1", "palavra2", "palavra3"],
  "options": ["palavra1", "palavra2", "palavra3", "distrator1", "distrator2", "distrator3"],
  "explanation": "Explicação histórica do contexto",
  "imagePrompt": "Ilustração histórica do evento",
  "mapPrompt": "Mapa do contexto geográfico",
  "audioPrompt": "Texto narrativo explicativo",
  "videoPrompt": "Animação explicativa do conceito"
}`;
            }
            const systemPrompt = `${periodPrompt}

IMPORTANTE:
- Responda APENAS com JSON válido
- Use português brasileiro
- Conteúdo historicamente preciso
- Nível: ${level}, Dificuldade: ${difficulty}
- Para imagePrompt: descrição detalhada em português para geração de imagem realista
- Para mapPrompt: descrição de mapa histórico detalhado
- Para audioPrompt: texto narrativo envolvente
- Para videoPrompt: descrição de cena animada histórica`;
            // Gerar conteúdo principal com Llama 3
            const content = await AIService.generateText(`${systemPrompt}\n\n${activityPrompt}\n\nJSON:`, 1500);
            const activityData = AIService.extractJSON(content);
            // Gerar imagem principal
            let imageUrl = null;
            if (activityData.imagePrompt) {
                try {
                    imageUrl = await AIService.generateImage(activityData.imagePrompt);
                }
                catch (e) {
                    console.error("Erro na imagem:", e);
                }
            }
            // Gerar mapa histórico
            let mapUrl = null;
            if (includeMap && activityData.mapPrompt) {
                try {
                    mapUrl = await AIService.generateMap(activityData.mapPrompt);
                }
                catch (e) {
                    console.error("Erro no mapa:", e);
                }
            }
            // Gerar avatar do personagem
            let avatarUrl = null;
            if (includeAvatar) {
                try {
                    avatarUrl = await AIService.generateAvatar(CHARACTER_AVATARS[periodId] || "Personagem histórico brasileiro");
                }
                catch (e) {
                    console.error("Erro no avatar:", e);
                }
            }
            // Gerar áudio (TTS) - placeholder por enquanto
            let audioUrl = null;
            if (includeAudio && activityData.audioPrompt) {
                try {
                    // TODO: implementar TTS real com Replicate ou outro serviço
                    audioUrl = "audio_placeholder_url";
                }
                catch (e) {
                    console.error("Erro no áudio:", e);
                }
            }
            // Gerar vídeo - placeholder por enquanto
            let videoUrl = null;
            if (includeVideo && activityData.videoPrompt) {
                try {
                    // TODO: implementar geração de vídeo
                    videoUrl = "video_placeholder_url";
                }
                catch (e) {
                    console.error("Erro no vídeo:", e);
                }
            }
            // Salvar no banco de dados
            const activity = await prisma.activity.create({
                data: {
                    type: activityType,
                    periodId,
                    level,
                    difficulty,
                    content: activityData,
                    imageUrl,
                    mapUrl,
                    avatarUrl,
                    audioUrl,
                    videoUrl,
                    isAIGenerated: true,
                },
            });
            res.json({
                id: activity.id,
                ...activityData,
                imageUrl,
                mapUrl,
                avatarUrl,
                audioUrl,
                videoUrl,
            });
        }
        catch (error) {
            console.error("Erro:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro ao gerar atividade",
            });
        }
    }
    static async getActivities(req, res) {
        try {
            const { periodId, type, limit = 10 } = req.query;
            const where = {};
            if (periodId)
                where.periodId = periodId;
            if (type)
                where.type = type;
            const activities = await prisma.activity.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                select: {
                    id: true,
                    type: true,
                    periodId: true,
                    level: true,
                    difficulty: true,
                    content: true,
                    imageUrl: true,
                    mapUrl: true,
                    avatarUrl: true,
                    audioUrl: true,
                    videoUrl: true,
                    createdAt: true,
                },
            });
            res.json(activities);
        }
        catch (error) {
            console.error("Erro ao buscar atividades:", error);
            res.status(500).json({ error: "Erro ao buscar atividades" });
        }
    }
    static async getActivityById(req, res) {
        try {
            const { id } = req.params;
            const activity = await prisma.activity.findUnique({
                where: { id },
                select: {
                    id: true,
                    type: true,
                    periodId: true,
                    level: true,
                    difficulty: true,
                    content: true,
                    imageUrl: true,
                    mapUrl: true,
                    avatarUrl: true,
                    audioUrl: true,
                    videoUrl: true,
                    createdAt: true,
                },
            });
            if (!activity) {
                return res.status(404).json({ error: "Atividade não encontrada" });
            }
            res.json(activity);
        }
        catch (error) {
            console.error("Erro ao buscar atividade:", error);
            res.status(500).json({ error: "Erro ao buscar atividade" });
        }
    }
}
