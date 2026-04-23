import { getGroqClient, AI_MODELS } from '../config/groq.js';

export class AIService {
  static async generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
    const groq = getGroqClient();
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: AI_MODELS.TEXT_GENERATION,
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 0.9,
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Erro na geração de texto com Groq:", error);
      throw error;
    }
  }

  static extractJSON(text: string): any {
    try {
      const cleanText = text.trim();

      // Tenta extrair bloco markdown primeiro
      const markdownMatch = cleanText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (markdownMatch) {
        try { return JSON.parse(markdownMatch[1].trim()); } catch { }
      }

      // Tenta objeto JSON (mais específico antes de array)
      const objMatch = cleanText.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch { }
      }

      // Tenta array JSON
      const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try { return JSON.parse(arrayMatch[0]); } catch { }
      }

      throw new Error("JSON não encontrado");
    } catch (error) {
      console.error("Erro ao extrair JSON:", error);
      throw new Error("Resposta da IA em formato inválido");
    }
  }

  static async fetchWikimediaImage(queryText: string): Promise<string | null> {
    try {
      if (!queryText || queryText.length < 3) return null;
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(queryText)}&gsrnamespace=6&iiprop=url&gsrlimit=1&origin=*`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'HistoricHop/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        const pages = data?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const imageUrl = pages[pageId].imageinfo?.[0]?.url;
          if (imageUrl && (imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.png'))) {
            return imageUrl;
          }
        }
      } catch (_e) { clearTimeout(timeoutId); }
      return null;
    } catch (_error) { return null; }
  }

  static async generateImage(prompt: string, width: number = 1024, height: number = 640): Promise<string> {
    let theme = prompt.split(':')[0].replace("Historical scene of ", "").trim();
    if (theme.length > 40) theme = theme.substring(0, 40);

    const wikimediaImg = await this.fetchWikimediaImage(theme);
    if (wikimediaImg) return wikimediaImg;

    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(theme + ", cinematic historical illustration, 8k")}/?width=${width}&height=${height}&nologo=true&seed=${seed}`;
  }

  static async generateMap(prompt: string): Promise<string | null> {
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", old parchment map style, historical geography, detailed, 8k")}/?width=1024&height=1024&nologo=true&seed=${seed}`;
  }

  static async generateAvatar(prompt: string): Promise<string | null> {
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", historical portrait, face focus, high quality, 8k")}/?width=512&height=512&nologo=true&seed=${seed}`;
  }
}
