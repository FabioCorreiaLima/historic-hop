import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
// Database
import { prisma } from "./config/database.js";
// Middleware
import { generalLimiter, aiGenerationLimiter } from "./middleware/rateLimit.js";
// Routes
import activityRoutes from "./routes/activities.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use(helmet());
app.use(compression());
// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Replace with your production domain
        : ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server
    credentials: true,
}));
// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/generate-activity', aiGenerationLimiter);
// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: "connected" // You could add a database health check here
    });
});
// API Routes
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Legacy routes (for backward compatibility)
import generateActivityRoutes from "./routes/generateActivity.js";
import generateQuestionsRoutes from "./routes/generateQuestions.js";
import historyChatRoutes from "./routes/historyChat.js";
import generateAudioRoutes from "./routes/generateAudio.js";
import speechToTextRoutes from "./routes/speechToText.js";
import manageQuestionsRoutes from "./routes/manageQuestions.js";
app.use("/api/generate-activity", generateActivityRoutes);
app.use("/api/generate-questions", generateQuestionsRoutes);
app.use("/api/history-chat", historyChatRoutes);
app.use("/api/generate-audio", generateAudioRoutes);
app.use("/api/speech-to-text", speechToTextRoutes);
app.use("/api/manage-questions", manageQuestionsRoutes);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Erro:", err.message);
    console.error("Stack:", err.stack);
    // Don't leak error details in production
    const errorResponse = process.env.NODE_ENV === 'production'
        ? { error: "Erro interno do servidor" }
        : { error: err.message, stack: err.stack };
    res.status(500).json(errorResponse);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Banco de dados: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
    console.log(`🤖 Replicate AI: ${process.env.REPLICATE_API_TOKEN ? 'Configurado' : 'Não configurado'}`);
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
