import { PeriodRepository } from "../repositories/PeriodRepository.js";

export class PeriodService {
  static async getAllPeriods() {
    const periods = await PeriodRepository.getAll();
    return periods.map((p: any) => this.formatPeriod(p));
  }

  static async getPeriodById(id: string) {
    const period = await PeriodRepository.getById(id);
    if (!period) return null;
    return this.formatPeriod(period);
  }

  static async savePeriod(data: any) {
    const saved = await PeriodRepository.save(data);
    return this.formatPeriod(saved);
  }

  private static formatPeriod(row: any) {
    // PostgreSQL retorna colunas em lowercase - normalizar camelCase
    const characterName = row.charactername || row.characterName || null;
    const characterEmoji = row.characteremoji || row.characterEmoji || null;
    const bgColor = row.bgcolor || row.bgColor || null;
    const borderColor = row.bordercolor || row.borderColor || null;

    const finalImageUrl = row.image_url || row.imageurl ||
      `https://image.pollinations.ai/prompt/Historical%20scene%20of%20${encodeURIComponent(row.name)}%20masterpiece%208k?width=1024&height=640&nologo=true`;

    return {
      ...row,
      characterName,
      characterEmoji,
      bgColor,
      borderColor,
      image_url: finalImageUrl,
      imageUrl: finalImageUrl,
    };
  }
}
