import Replicate from 'replicate';
if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is required');
}
export const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});
export const AI_MODELS = {
    TEXT_GENERATION: 'meta/meta-llama-3-70b-instruct',
    IMAGE_GENERATION: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    AUDIO_GENERATION: 'openai/whisper', // placeholder for TTS
    VIDEO_GENERATION: 'stability-ai/stable-video-diffusion', // placeholder
};
