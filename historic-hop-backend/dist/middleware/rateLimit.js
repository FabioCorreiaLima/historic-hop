import rateLimit from 'express-rate-limit';
export const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
export const generalLimiter = createRateLimit(15 * 60 * 1000, // 15 minutes
100, // limit each IP to 100 requests per windowMs
'Muitas requisições, tente novamente mais tarde.');
export const aiGenerationLimiter = createRateLimit(60 * 1000, // 1 minute
5, // limit each IP to 5 AI generations per minute
'Limite de geração de IA atingido, aguarde um minuto.');
export const authLimiter = createRateLimit(15 * 60 * 1000, // 15 minutes
5, // limit each IP to 5 auth attempts per windowMs
'Muitas tentativas de autenticação, tente novamente mais tarde.');
