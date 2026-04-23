import { Router } from "express";
const router = Router();
// TODO: Conectar com Supabase para gerenciar perguntas (GET, POST, PUT, DELETE)
router.get("/", async (req, res) => {
    try {
        // Buscar todas as perguntas
        res.json({ questions: [], message: "Ainda não implementado" });
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: "Erro ao buscar perguntas" });
    }
});
router.post("/", async (req, res) => {
    try {
        // Criar nova pergunta
        res.json({ message: "Criação de perguntas ainda não implementada" });
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: "Erro ao criar pergunta" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        // Atualizar pergunta
        res.json({ message: "Atualização de perguntas ainda não implementada" });
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: "Erro ao atualizar pergunta" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        // Deletar pergunta
        res.json({ message: "Deleção de perguntas ainda não implementada" });
    }
    catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: "Erro ao deletar pergunta" });
    }
});
export default router;
