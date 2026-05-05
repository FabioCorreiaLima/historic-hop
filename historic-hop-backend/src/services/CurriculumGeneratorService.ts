import { AIService } from "./AIService.js";
import { PeriodRepository } from "../repositories/PeriodRepository.js";
import { CurriculumRepository, DEFAULT_COURSE_ID } from "../repositories/CurriculumRepository.js";
import { ActivityService } from "./ActivityService.js";
import crypto from "crypto";
import { query } from "../config/database.js";

export class CurriculumGeneratorService {
  static async generateBNCCFullCurriculum() {
    console.log("Iniciando geração do currículo da BNCC via IA...");

    const prompt = `
Você é um especialista em educação e história do Brasil, focado na Base Nacional Comum Curricular (BNCC).
Sua tarefa é gerar a grade curricular completa de História do Brasil, desde antes do descobrimento (povos originários) até os dias atuais.
Divida a história em períodos cronológicos (aproximadamente 15 a 25 períodos).

Responda APENAS com um JSON válido contendo um array de objetos. 
Formato esperado para cada objeto do array:
{
  "id": "slug-do-periodo", // ex: "brasil-colonia-economia-acucareira"
  "name": "Nome do Período",
  "emoji": "📜", // um emoji representativo
  "years": "1530-1700", // período de anos
  "color": "#3B82F6", // uma cor em hex representativa, varie as cores
  "description": "Uma descrição engajadora de 2 a 3 frases sobre o que o aluno vai aprender neste módulo."
}

JSON:
`;

    // Aumentamos os tokens pois a resposta será grande
    const jsonStr = await AIService.generateText(prompt, 3000);
    const periodsData = AIService.extractJSON(jsonStr);

    if (!Array.isArray(periodsData)) {
      throw new Error("A IA não retornou um array de períodos válido.");
    }

    console.log(`IA gerou ${periodsData.length} períodos. Inserindo no banco de dados...`);

    // Garantir que o curso default existe
    await this.ensureCourseExists(DEFAULT_COURSE_ID, "História do Brasil (BNCC)");

    // Limpar os periods do curso atual para não duplicar se rodar de novo
    await query(`DELETE FROM course_periods WHERE course_id = $1`, [DEFAULT_COURSE_ID]);

    const periodIds: string[] = [];

    for (let i = 0; i < periodsData.length; i++) {
      const p = periodsData[i];
      const periodId = p.id || crypto.randomUUID();
      
      const savedPeriod = await PeriodRepository.save({
        id: periodId,
        name: p.name,
        emoji: p.emoji,
        years: p.years,
        color: p.color,
        description: p.description,
        order_index: i
      });

      await CurriculumRepository.linkPeriodToCourse(DEFAULT_COURSE_ID, savedPeriod.id, i);
      
      // Criar a lição principal para este período para permitir rastreio de progresso
      const lessonId = `lesson_${savedPeriod.id}_main`;
      await query(
        `INSERT INTO lessons (id, period_id, title, order_index, xp_reward)
         VALUES ($1, $2, $3, 0, 15)
         ON CONFLICT (id) DO NOTHING`,
        [lessonId, savedPeriod.id, "Trilha Principal"]
      );

      periodIds.push(savedPeriod.id);
      
      // Pré-gerar algumas atividades apenas para os primeiros períodos para evitar timeout da requisição HTTP
      if (i < 5) {
        try {
          console.log(`✨ [BNCC] Gerando atividades iniciais para ${savedPeriod.name}...`);
          await ActivityService.generateBatch(savedPeriod.id, 2, 1, "Fácil");
          console.log(`✅ [BNCC] Atividades geradas para ${savedPeriod.name}`);
        } catch (actErr) {
          console.error(`❌ [BNCC] Erro ao pré-gerar atividades para ${savedPeriod.id}:`, actErr);
        }
      } else {
        console.log(`⏭️ [BNCC] Pulando pré-geração para ${savedPeriod.name} (será gerado sob demanda)`);
      }

      console.log(`Salvo: ${i+1}/${periodsData.length} - ${savedPeriod.name}`);
    }

    console.log("Currículo gerado e salvo com sucesso!");
    return { success: true, count: periodsData.length, periods: periodsData };
  }

  private static async ensureCourseExists(courseId: string, title: string) {
    // Tenta inserir o curso caso não exista. A estrutura exata da tabela courses
    // precisa aceitar isso. Se faltarem campos, ele usará defaults.
    try {
      await query(
        `INSERT INTO courses (id, title, slug) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [courseId, title, courseId]
      );
    } catch (e) {
      console.error("Aviso ao tentar garantir a existência do curso (pode já existir):", e);
    }
  }
}
