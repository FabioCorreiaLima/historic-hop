import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Phaser from 'phaser';
import { api } from '@/lib/api';
import { QuizActivity } from '@/types';
import { Loader2, X, Volume2, VolumeX, Heart, Trophy, Ghost as GhostIcon } from 'lucide-react';

interface PacManGameProps {
  periodId: string;
  onGameOver: (score: number, won: boolean) => void;
  onBack: () => void;
}

const BEEP_FREQ = {
  DOT: 800,
  POWERUP: 1200,
  DEATH: 200,
  CORRECT: 1000,
  WRONG: 150,
  BGM_LOW: 110,
  BGM_HIGH: 165
};

export default function PacManGame({ periodId, onGameOver, onBack }: PacManGameProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const bgmInterval = useRef<any>(null);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizActivity | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [muted, setMuted] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const phaserSceneRef = useRef<any>(null);

  const playBeep = useCallback((freq: number, duration: number = 0.1, volume: number = 0.1) => {
    if (muted) return;
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
      
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = freq < 300 ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) { }
  }, [muted]);

  // Música de fundo estilo Pac-Man (BPM constante)
  const startBGM = useCallback(() => {
    if (bgmInterval.current) clearInterval(bgmInterval.current);
    let step = 0;
    bgmInterval.current = setInterval(() => {
      if (!muted && !showQuestion) {
        const freq = step % 4 === 0 ? BEEP_FREQ.BGM_LOW : BEEP_FREQ.BGM_HIGH;
        playBeep(freq, 0.05, 0.03);
      }
      step++;
    }, 250);
  }, [muted, showQuestion, playBeep]);

  useEffect(() => {
    startBGM();
    return () => { if (bgmInterval.current) clearInterval(bgmInterval.current); };
  }, [startBGM]);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    class MainScene extends Phaser.Scene {
      player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      ghosts!: Phaser.Physics.Arcade.Group;
      dots!: Phaser.Physics.Arcade.Group;
      specialItems!: Phaser.Physics.Arcade.Group;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      innerScore = 0;
      innerLives = 3;

      constructor() { super({ key: 'MainScene' }); }

      create() {
        phaserSceneRef.current = this;
        this.cameras.main.setBackgroundColor('#020617');
        this.createTextures();

        const walls = this.physics.add.staticGroup();
        this.dots = this.physics.add.group();
        this.specialItems = this.physics.add.group();
        this.ghosts = this.physics.add.group();

        const levelLayout = [
          "WWWWWWWWWWWWWWWWWWWW",
          "W........W.........W",
          "W.WW.WWW.W.WWW.WW.SW",
          "W.WW.WWW.W.WWW.WW..W",
          "W...G..............W",
          "W.WW.W.WWWWW.W.WW..W",
          "W....W...W...W.....W",
          "WWWW.WWW.W.WWW.WWWWW",
          "   W.W.......W.W    ",
          "WWWW.W.WW WW.W.WWWWW",
          "G......W   W.......G",
          "WWWW.W.WWWWW.W.WWWWW",
          "   W.W.......W.W    ",
          "WWWW.W.WWWWW.W.WWWWW",
          "W........W.........W",
          "W.WW.WWW.W.WWW.WW..W",
          "W..W.....P.....W...W",
          "WW.W.W.WWWWW.W.W.WWW",
          "WS...W...W...W....SW",
          "WWWWWWWWWWWWWWWWWWWW",
        ];

        const tileSize = 40;
        levelLayout.forEach((row, y) => {
          row.split('').forEach((char, x) => {
            const px = x * tileSize + 20;
            const py = y * tileSize + 20;
            if (char === 'W') walls.create(px, py, 'wall');
            else if (char === '.') this.dots.create(px, py, 'dot');
            else if (char === 'S') this.specialItems.create(px, py, 'special');
            else if (char === 'P') this.player = this.physics.add.sprite(px, py, 'player');
            else if (char === 'G') this.createGhost(px, py);
          });
        });

        this.physics.add.collider(this.player, walls);
        this.physics.add.collider(this.ghosts, walls);
        this.physics.add.overlap(this.player, this.dots, (p, dot) => {
          dot.destroy();
          this.innerScore += 10;
          setScore(this.innerScore);
          playBeep(BEEP_FREQ.DOT, 0.05);
          if (this.dots.countActive(true) === 0) this.finishGame(true);
        });
        this.physics.add.overlap(this.player, this.specialItems, (p, s) => {
          s.destroy();
          playBeep(BEEP_FREQ.POWERUP, 0.2);
          this.physics.world.pause();
          window.dispatchEvent(new CustomEvent('SHOW_QUESTION_EVENT'));
        });
        this.physics.add.overlap(this.player, this.ghosts, () => this.handleDeath());
        this.cursors = this.input.keyboard!.createCursorKeys();
      }

      createGhost(x: number, y: number) {
        const ghost = this.ghosts.create(x, y, 'ghost');
        ghost.setCollideWorldBounds(true);
        ghost.setBounce(1);
        ghost.setVelocity(120, 120);
        ghost.setTint(0xef4444);
      }

      handleDeath() {
        if (this.player.alpha < 1) return;
        playBeep(BEEP_FREQ.DEATH, 0.3, 0.2);
        this.innerLives--;
        setLives(this.innerLives);
        this.cameras.main.shake(300, 0.02);
        if (this.innerLives <= 0) this.finishGame(false);
        else {
          this.player.setPosition(400, 660);
          this.player.setAlpha(0.5);
          this.time.delayedCall(2000, () => this.player && this.player.setAlpha(1));
        }
      }

      finishGame(won: boolean) {
        this.physics.pause();
        onGameOver(this.innerScore, won);
      }

      update() {
        if (!this.player || this.physics.world.isPaused) return;
        const speed = 200;
        if (this.cursors.left.isDown) { this.player.setVelocity(-speed, 0); this.player.setAngle(180); }
        else if (this.cursors.right.isDown) { this.player.setVelocity(speed, 0); this.player.setAngle(0); }
        else if (this.cursors.up.isDown) { this.player.setVelocity(0, -speed); this.player.setAngle(-90); }
        else if (this.cursors.down.isDown) { this.player.setVelocity(0, speed); this.player.setAngle(90); }
        else this.player.setVelocity(0, 0);

        this.ghosts.getChildren().forEach((g: any) => {
          const dist = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y);
          if (dist < 200) this.physics.moveToObject(g, this.player, 140);
          else if (Math.random() < 0.02) {
             const angle = Phaser.Math.Between(0, 3) * 90;
             this.physics.velocityFromAngle(angle, 120, g.body.velocity);
          }
        });
      }

      createTextures() {
        const g = this.add.graphics();
        // Pacman
        g.clear(); g.fillStyle(0xfacc15); g.beginPath(); g.moveTo(16, 16);
        g.arc(16, 16, 16, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(330), false);
        g.lineTo(16, 16); g.closePath(); g.fillPath(); g.generateTexture('player', 32, 32);
        // Ghost
        g.clear(); g.fillStyle(0xffffff); g.fillRoundedRect(4, 4, 24, 20, { tl: 12, tr: 12, bl: 0, br: 0 });
        g.fillCircle(10, 24, 4); g.fillCircle(16, 24, 4); g.fillCircle(22, 24, 4);
        g.fillStyle(0x000000); g.fillCircle(10, 12, 2); g.fillCircle(22, 12, 2);
        g.generateTexture('ghost', 32, 32);
        // Dot
        g.clear(); g.fillStyle(0xffffff, 0.6); g.fillCircle(4, 4, 3); g.generateTexture('dot', 8, 8);
        // Special
        g.clear(); g.fillStyle(0xf59e0b); g.fillRect(4, 8, 24, 16); g.fillStyle(0x78350f); g.fillRect(2, 6, 4, 20); g.fillRect(26, 6, 4, 20);
        g.generateTexture('special', 32, 32);
        // Wall
        g.clear(); g.lineStyle(2, 0x3b82f6); g.strokeRect(2, 2, 36, 36); g.fillStyle(0x1e3a8a, 0.3); g.fillRect(2, 2, 36, 36);
        g.generateTexture('wall', 40, 40);
        g.destroy();
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS, 
      parent: gameContainerRef.current,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 800
      },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
      scene: MainScene
    };

    gameInstance.current = new Phaser.Game(config);

    const handleShowQuestion = async () => {
      setLoadingQuestion(true); setShowQuestion(true);
      try {
        // Aumentamos o limite para 50 para ter mais variedade se disponível
        const activities = await api.activities.getActivitiesByPeriod(periodId, 50);
        const quiz = activities.filter(a => a.type === 'quiz') as QuizActivity[];
        if (quiz.length > 0) {
          // Tentar encontrar uma pergunta não respondida ainda
          const unasked = quiz.filter(q => !askedQuestions.includes(q.id));
          const list = unasked.length > 0 ? unasked : quiz;
          const randomQ = list[Math.floor(Math.random() * list.length)];
          setCurrentQuestion(randomQ);
          setAskedQuestions(prev => [...prev, randomQ.id]);
        } else resumeGame(true);
      } catch (err) { resumeGame(true); } finally { setLoadingQuestion(false); }
    };

    window.addEventListener('SHOW_QUESTION_EVENT', handleShowQuestion);
    return () => {
      if (gameInstance.current) gameInstance.current.destroy(true);
      window.removeEventListener('SHOW_QUESTION_EVENT', handleShowQuestion);
    };
  }, [periodId, askedQuestions]);

  const resumeGame = (isCorrect: boolean) => {
    setShowQuestion(false); setCurrentQuestion(null);
    if (phaserSceneRef.current) {
      if (isCorrect) {
        playBeep(BEEP_FREQ.CORRECT, 0.3, 0.2);
        phaserSceneRef.current.innerScore += 500;
        setScore(phaserSceneRef.current.innerScore);
        phaserSceneRef.current.cameras.main.flash(500, 0, 255, 0);
      } else {
        playBeep(BEEP_FREQ.WRONG, 0.4, 0.2);
        phaserSceneRef.current.handleDeath();
      }
      phaserSceneRef.current.physics.world.resume();
    }
  };

  const handleAnswerSubmit = (index: number) => {
    if (!currentQuestion) return;
    resumeGame(index === currentQuestion.correctIndex);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-950 relative py-12 px-4 select-none" onClick={() => audioCtx.current?.resume()}>
       <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
         <div className="flex gap-2">
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
              <X className="w-6 h-6" />
            </button>
            <button onClick={() => setMuted(!muted)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
         </div>

         <div className="flex gap-4">
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-amber-400/30">
               <Trophy className="w-5 h-5 text-amber-400" />
               <span className="text-xl font-black text-white tabular-nums">{score}</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-red-500/30">
               <Heart className="w-5 h-5 text-red-500 fill-red-500" />
               <span className="text-xl font-black text-white">{lives}</span>
            </div>
         </div>
       </div>
       
       <h2 className="text-2xl md:text-4xl font-black text-amber-400 mb-6 tracking-[0.2em] text-center drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] uppercase italic">PAC-MAN HISTÓRICO</h2>
       
       <div 
         ref={gameContainerRef} 
         className="rounded-[2.5rem] overflow-hidden border-[12px] border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-slate-900" 
         style={{ width: '100%', maxWidth: '800px', height: 'auto', aspectRatio: '1/1' }}
       />

       {showQuestion && (
         <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 max-w-xl w-full text-center border-4 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.6)] animate-pop">
               <div className="w-20 h-20 mx-auto mb-6 bg-amber-400 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-amber-400/40 animate-bounce">📜</div>
               <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">DESAFIO DO TEMPO!</h3>
               
               {loadingQuestion || !currentQuestion ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
                   <p className="text-white/60 font-bold tracking-widest uppercase">Decifrando Pergaminho...</p>
                 </div>
               ) : (
                 <>
                   <p className="text-xl text-white mb-10 font-bold leading-relaxed">{currentQuestion.question}</p>
                   <div className="grid grid-cols-1 gap-4">
                     {currentQuestion.options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => handleAnswerSubmit(i)}
                         className="p-5 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-300 text-white text-left font-black transition-all active:scale-95 group"
                       >
                         <span className="inline-block w-8 h-8 bg-black/20 group-hover:bg-black/40 rounded-lg text-center mr-3">{String.fromCharCode(65 + i)}</span>
                         {opt}
                       </button>
                     ))}
                   </div>
                 </>
               )}
            </div>
         </div>
       )}
    </div>
  );
}
