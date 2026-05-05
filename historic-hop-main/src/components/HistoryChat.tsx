import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { HistoricalPeriod } from "@/data/activities";
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
        const data = await api.periods.getOne(initialPeriod.id);
        if (data) setPeriodData(data);
      } catch (err) {
        console.warn("Erro ao atualizar chat:", err);
      }
    };
    refreshData();
  }, [initialPeriod?.id]);

  // Garantir fallbacks para evitar ReferenceError ou undefined
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

  // Fetch suggested questions on mount
  useEffect(() => {
    if (!initialPeriod?.id) return;
    const fetchQuestions = async () => {
      try {
        const data = await api.historyChat.getSuggestedQuestions(initialPeriod.id);
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, index: number) => {
    window.speechSynthesis.cancel();
    // Regex mais agressiva para remover QUALQUER caractere não-alfanumérico/pontuação básica
    const cleanText = text
      .replace(/[^\w\sÀ-ÿ.,!?;:]/gi, '') 
      .replace(/\s+/g, ' ')
      .trim();

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

    utterance.onerror = () => {
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
      const data = await api.historyChat.sendMessage({
        messages: [...messages, userMsg],
        periodId: periodData.id,
        characterName: charName,
        periodName: periodName,
        periodYears: periodYears,
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
      console.error("Erro no chat:", e);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desculpe, tive um problema para processar sua pergunta. Pode tentar novamente?",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.svg') || url.includes('pollinations.ai');
  };

  const currentImg = periodData?.image_url || periodData?.imageUrl;
  const finalBg = isImageUrl(currentImg) ? currentImg : "/map-bg.png";

  return (
    <div 
      className="min-h-screen w-full relative pt-6 pb-12 flex flex-col items-center overflow-x-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("${finalBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center gap-4 py-6 border-b border-white/10 mb-4">
          <button 
            onClick={() => { window.speechSynthesis.cancel(); onBack(); }} 
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
            {charEmoji}
          </div>
          
          <div className="flex-1">
            <h2 className="font-black text-white text-lg tracking-tight leading-tight">{charName}</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{periodName}</p>
          </div>

          <button
            onClick={() => {
              const nextVal = !audioEnabled;
              setAudioEnabled(nextVal);
              if (!nextVal) window.speechSynthesis.cancel();
            }}
            className={`p-3 rounded-2xl transition-all border ${audioEnabled ? 'bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 py-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
              <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 text-sm shadow-2xl backdrop-blur-xl border ${
                msg.role === "user"
                  ? "bg-primary/90 text-white border-white/10 rounded-br-none"
                  : "bg-white/5 text-white/90 border-white/10 rounded-bl-none"
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 leading-relaxed">
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-invert prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="font-medium">{msg.content}</span>
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => toggleAudio(i)}
                      className={`mt-1 p-2 rounded-xl transition-all ${
                        msg.isPlaying ? 'bg-primary text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'
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
              <div className="bg-white/5 border border-white/10 rounded-[2rem] rounded-bl-none px-6 py-5 shadow-2xl backdrop-blur-xl">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions Area */}
        <div className="py-6 border-t border-white/10 mt-4 bg-transparent backdrop-blur-sm rounded-t-[2rem]">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Perguntas Sugeridas</p>
          </div>
          
          {isLoadingQuestions ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 w-40 bg-white/5 animate-pulse rounded-2xl flex-shrink-0 border border-white/10" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuestion(q)}
                  disabled={isLoading}
                  className="text-left text-xs font-bold px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-white/70 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryChat;
