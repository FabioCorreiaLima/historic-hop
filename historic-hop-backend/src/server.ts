import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase, pool } from "./config/database.js";

// Routes
import activityRoutes from "./routes/activities.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import generateActivityRoutes from "./routes/generateActivity.js";
import historyChatRoutes from "./routes/historyChat.js";
import generateAudioRoutes from "./routes/generateAudio.js";
import speechToTextRoutes from "./routes/speechToText.js";
import generateQuestionsRoutes from "./routes/generateQuestions.js";
import manageQuestionsRoutes from "./routes/manageQuestions.js";
import progressRoutes from "./routes/progress.js";
import streaksRoutes from "./routes/streaks.js";
import achievementsRoutes from "./routes/achievements.js";
import rankingRoutes from "./routes/ranking.js";
import periodsRoutes from "./routes/periods.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/generate-activity", generateActivityRoutes);
app.use("/api/history-chat", historyChatRoutes);
app.use("/api/generate-audio", generateAudioRoutes);
app.use("/api/speech-to-text", speechToTextRoutes);
app.use("/api/generate-questions", generateQuestionsRoutes);
app.use("/api/manage-questions", manageQuestionsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/streaks", streaksRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/historical-periods", periodsRoutes);

async function startServer() {
  try {
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor pronto na porta ${PORT}`);
      console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? 'OK' : 'Faltando TOKEN'}`);
    });

    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} ocupada. Mate o processo anterior.`);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("Falha fatal no boot:", err);
  }
}

startServer();