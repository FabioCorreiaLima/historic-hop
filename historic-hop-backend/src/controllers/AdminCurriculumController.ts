import { Request, Response } from "express";
import { CurriculumGeneratorService } from "../services/CurriculumGeneratorService.js";
import { query } from "../config/database.js";

export class AdminCurriculumController {
  static async generateBNCCFullCurriculum(req: Request, res: Response) {
    try {
      const result = await CurriculumGeneratorService.generateBNCCFullCurriculum();
      res.status(200).json({ message: "Currículo gerado com sucesso!", result });
    } catch (error: any) {
      console.error("Erro ao gerar currículo completo:", error);
      res.status(500).json({ error: "Erro interno ao gerar o currículo.", details: error.message });
    }
  }

  static async clearAll(req: Request, res: Response) {
    try {
      console.log("🧹 Admin solicitou limpeza total do currículo...");
      await query("BEGIN");
      // Ordem de deleção para evitar problemas de foreign key
      await query("DELETE FROM user_lesson_progress CASCADE");
      await query("DELETE FROM course_periods CASCADE");
      await query("DELETE FROM lessons CASCADE");
      await query("DELETE FROM activities CASCADE");
      await query("DELETE FROM historical_periods CASCADE");
      await query("COMMIT");
      res.json({ success: true, message: "Banco de dados de currículo limpo!" });
    } catch (error: any) {
      await query("ROLLBACK");
      console.error("Erro ao limpar banco:", error);
      res.status(500).json({ error: "Erro ao limpar banco", details: error.message });
    }
  }

  static async seedStandard(req: Request, res: Response) {
    try {
      console.log("🌱 Admin solicitou seed padrão (6 períodos)...");
      const periods = [
        { id: "colonia", name: "Brasil Colônia", emoji: "⛵", years: "1500–1822", color: "text-emerald-600", description: "Chegada dos portugueses, escravidão, ciclos econômicos", characterName: "Pajé Tupi", characterEmoji: "🏹", order_index: 10 },
        { id: "imperio", name: "Império do Brasil", emoji: "👑", years: "1822–1889", color: "text-amber-600", description: "Independência, D. Pedro I e II, Abolição da Escravidão", characterName: "D. Pedro II", characterEmoji: "🎩", order_index: 20 },
        { id: "republica_velha", name: "República Velha", emoji: "☕", years: "1889–1930", color: "text-orange-600", description: "Política do café com leite, coronelismo, revoltas", characterName: "Coronel Silva", characterEmoji: "🎩", order_index: 30 },
        { id: "era_vargas", name: "Era Vargas", emoji: "🏭", years: "1930–1945", color: "text-blue-600", description: "Getúlio Vargas, CLT, Estado Novo, industrialização", characterName: "Operário João", characterEmoji: "🔧", order_index: 40 },
        { id: "ditadura", name: "Ditadura Militar", emoji: "✊", years: "1964–1985", color: "text-red-600", description: "Golpe militar, AI-5, resistência, redemocratização", characterName: "Estudante Maria", characterEmoji: "📢", order_index: 50 },
        { id: "nova_republica", name: "Nova República", emoji: "🗳️", years: "1985–presente", color: "text-purple-600", description: "Constituição de 88, Plano Real, democracia", characterName: "Cidadão Carlos", characterEmoji: "🗳️", order_index: 60 }
      ];

      for (const [index, p] of periods.entries()) {
        await query(
          `INSERT INTO historical_periods (id, name, emoji, years, color, description, charactername, characteremoji, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name, 
            description = EXCLUDED.description,
            charactername = EXCLUDED.charactername,
            characteremoji = EXCLUDED.characteremoji`,
          [p.id, p.name, p.emoji, p.years, p.color, p.description, p.characterName, p.characterEmoji, p.order_index]
        );

        // Link ao curso padrão
        await query(
          `INSERT INTO course_periods (course_id, period_id, order_index)
           VALUES ($1, $2, $3)
           ON CONFLICT (course_id, period_id) DO UPDATE SET order_index = EXCLUDED.order_index`,
          ["default-br", p.id, index]
        );

        // Criar lição principal
        const lessonId = `lesson_${p.id}_main`;
        await query(
          `INSERT INTO lessons (id, period_id, title, order_index, xp_reward)
           VALUES ($1, $2, $3, 0, 15)
           ON CONFLICT (id) DO NOTHING`,
          [lessonId, p.id, "Trilha Principal"]
        );
      }
      res.json({ success: true, message: "Seed padrão concluído!" });
    } catch (error: any) {
      console.error("Erro no seed padrão:", error);
      res.status(500).json({ error: "Erro ao executar seed padrão" });
    }
  }
}
