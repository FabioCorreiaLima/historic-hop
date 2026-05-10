import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { HistoricalPeriod } from "@/types";
import { api } from "@/lib/api";

interface Props {
  period: HistoricalPeriod;
  onBack: () => void;
}

type Msg = {
  role: "user" | "assistant";
  content: string;
  isPlaying?: boolean;
};

const HistoryChat = ({ period: initialPeriod, onBack }: Props) => {
  const [periodData, setPeriodData] = useState(initialPeriod);
  
  useEffect(() => {
    const refreshData = async () => {
      if (!initialPeriod?.id) return;
      try {
        const data = await api.apiCall(`/periods/${initialPeriod.id}`);
        if (data) setPeriodData(data);
      } catch (err) {
        console.warn("Erro ao atualizar chat:", err);
      }
    };
    refreshData();
  }, [initialPeriod?.id]);

  const charName = periodData?.characterName || "Historiador";
  const charEmoji = periodData?.characterEmoji || "🧐";
  const periodYears = periodData?.years || "";
  const periodName = periodData?.name || "este período";

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Olá! Eu sou ${charName} ${charEmoji}. Estou aqui para lhe contar tudo sobre ${periodName} ${periodYears ? `(${periodYears})` : ""}. Escolha uma das perguntas abaixo para começarmos!`,
      isPlaying: false,
    },
  ]);
  
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialPeriod?.id) return;
    const fetchQuestions = async () => {
      try {
        const data = await api.apiCall(`/chat/suggested-questions?periodId=${initialPeriod.id}`);
        setSuggestedQuestions(data.questions || []);
      } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [initialPeriod?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const speak = (text: string, index: number) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[^\w\sÀ-ÿ.,!?;:]/gi, '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt_BR"));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingIndex(index);
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlaying: true } : { ...m, isPlaying: false }));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlaying: false } : m));
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = (index: number) => {
    if (currentSpeakingIndex === index && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlaying: false } : m));
    } else {
      speak(messages[index].content, index);
    }
  };

  const handleSelectQuestion = async (question: string) => {
    if (isLoading || !periodData) return;

    const userMsg: Msg = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.apiCall("/chat/message", {
        method: "POST",
        body: {
          messages: [...messages, userMsg],
          periodId: periodData.id,
          characterName: charName,
          periodName: periodName,
          periodYears: periodYears,
        }
      });

      const assistantContent = data.response;
      const newMsgIndex = messages.length + 1;

      setMessages(prev => [...prev, {
        role: "assistant",
        content: assistantContent,
        isPlaying: false
      }]);

      if (audioEnabled) {
        setTimeout(() => speak(assistantContent, newMsgIndex), 100);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desculpe, tive um problema para processar sua pergunta.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-quiz-bg text-quiz-text-main z-50 flex flex-col font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-quiz-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        
        {/* Header Responsivo */}
        <header className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-quiz-border bg-quiz-surface/50 backdrop-blur-xl shrink-0">
          <button 
            onClick={() => { window.speechSynthesis.cancel(); onBack(); }} 
            className="p-2.5 md:p-3 rounded-xl bg-quiz-bg border border-quiz-border hover:border-quiz-primary transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-quiz-text-main" />
          </button>
          
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-quiz-bg border border-quiz-border flex items-center justify-center text-xl md:text-3xl shadow-inner">
            {charEmoji}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-sm md:text-xl tracking-tight leading-tight truncate uppercase">{charName}</h2>
            <p className="text-[8px] md:text-[10px] font-bold text-quiz-primary uppercase tracking-[0.2em] truncate">{periodName}</p>
          </div>

          <button
            onClick={() => {
              const nextVal = !audioEnabled;
              setAudioEnabled(nextVal);
              if (!nextVal) window.speechSynthesis.cancel();
            }}
            className={`p-2.5 md:p-3 rounded-xl transition-all border ${audioEnabled ? 'bg-quiz-primary/10 border-quiz-primary/40 text-quiz-primary shadow-lg shadow-quiz-primary/10' : 'bg-quiz-bg border-quiz-border text-quiz-text-muted'}`}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </header>

        {/* Mensagens com Layout Adaptável */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
              <div className={`max-w-[90%] md:max-w-[80%] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 text-sm md:text-base shadow-2xl border ${
                msg.role === "user"
                  ? "bg-quiz-primary text-black border-quiz-primary/20 rounded-br-none"
                  : "bg-quiz-surface text-quiz-text-main border-quiz-border rounded-bl-none"
              }`}>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-1 leading-relaxed">
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm md:prose-base max-w-none prose-invert prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="font-bold">{msg.content}</span>
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => toggleAudio(i)}
                      className={`mt-1 p-2 rounded-xl transition-all shrink-0 ${
                        msg.isPlaying ? 'bg-quiz-primary text-black animate-pulse' : 'bg-quiz-bg hover:bg-quiz-primary/10 text-quiz-text-muted hover:text-quiz-primary'
                      }`}
                    >
                      {msg.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-quiz-surface border border-quiz-border rounded-2xl rounded-bl-none p-4 md:p-6">
                <Loader2 className="w-5 h-5 animate-spin text-quiz-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Área de Sugestões Responsiva */}
        <div className="p-4 md:p-8 bg-quiz-surface border-t border-quiz-border shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-quiz-primary" />
            <p className="text-[9px] md:text-[10px] font-black text-quiz-text-muted uppercase tracking-[0.2em]">O que perguntar?</p>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-32 md:max-h-none overflow-y-auto">
            {isLoadingQuestions ? (
              [1, 2].map(i => <div key={i} className="h-10 w-32 bg-quiz-bg animate-pulse rounded-xl" />)
            ) : (
              suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuestion(q)}
                  disabled={isLoading}
                  className="text-left text-[10px] md:text-xs font-bold px-4 py-2.5 md:px-5 md:py-3 rounded-xl bg-quiz-bg border border-quiz-border hover:border-quiz-primary/50 hover:bg-quiz-primary/5 text-quiz-text-main transition-all active:scale-95 disabled:opacity-30"
                >
                  {q}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryChat;
