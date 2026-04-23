import { replicate, AI_MODELS } from '../config/replicate.js';
export class AIService {
    static async generateText(prompt, maxTokens = 1000) {
        try {
            const output = await replicate.run(AI_MODELS.TEXT_GENERATION, {
                input: {
                    prompt,
                    max_tokens: maxTokens,
                },
            });
            return Array.isArray(output) ? output.join('') : output;
        }
        catch (error) {
            console.error('Erro na geração de texto:', error);
            throw new Error('Falha ao gerar texto com IA');
        }
    }
    static async generateImage(prompt, width = 1024, height = 1024) {
        try {
            const output = await replicate.run(AI_MODELS.IMAGE_GENERATION, {
                input: {
                    prompt,
                    width,
                    height,
                    negative_prompt: "blurry, low quality, distorted, ugly, modern elements",
                },
            });
            return Array.isArray(output) ? output[0] : output;
        }
        catch (error) {
            console.error('Erro na geração de imagem:', error);
            throw new Error('Falha ao gerar imagem com IA');
        }
    }
    static async generateMap(prompt) {
        try {
            const mapPrompt = `Historical map: ${prompt}. Detailed, accurate, educational, vintage style, clean design.`;
            return await this.generateImage(mapPrompt, 1024, 768);
        }
        catch (error) {
            console.error('Erro na geração de mapa:', error);
            throw new Error('Falha ao gerar mapa histórico');
        }
    }
    static async generateAvatar(prompt) {
        try {
            const avatarPrompt = `${prompt}. Realistic portrait, detailed facial features, historical character, dramatic lighting, high quality.`;
            return await this.generateImage(avatarPrompt, 512, 512);
        }
        catch (error) {
            console.error('Erro na geração de avatar:', error);
            throw new Error('Falha ao gerar avatar');
        }
    }
    static extractJSON(content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Não foi possível extrair JSON da resposta da IA');
        }
        return JSON.parse(jsonMatch[0]);
    }
}
