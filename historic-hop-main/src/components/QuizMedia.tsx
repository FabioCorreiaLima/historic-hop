import { useState, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import type { QuizQuestion } from "@/data/quizQuestions";

interface QuizMediaProps {
  question: QuizQuestion;
}

const QuizMedia = ({ question }: QuizMediaProps) => {
  // CORREÇÃO: Guard Clause - Se a questão não existe, não renderiza nada
  if (!question) return null;

  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentImageUrl = question.imageUrl || (question as any).image_url;
  const hasAudio = question.audioUrl;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  return (
    <div className="mb-5 space-y-3">
      {/* Exemplo de renderização de imagem */}
      {currentImageUrl && (
        <img src={currentImageUrl} alt="Media" className="rounded-lg w-full h-auto" />
      )}

      {/* Áudio */}
      {hasAudio && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30"
          >
            {audioPlaying ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary" />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium">Ouça o áudio</p>
          </div>
          <audio
            ref={audioRef}
            src={question.audioUrl}
            onEnded={() => setAudioPlaying(false)}
          />
        </div>
      )}
    </div>
  );
};

export default QuizMedia;