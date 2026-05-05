import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Phaser from 'phaser';
import { api } from '@/lib/api';
import { Loader2, X, Volume2, VolumeX, Heart, Trophy, BookOpen, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { HistorianNotebook } from '@/components/HistorianNotebook';
import { useHistorianNotebook } from '@/hooks/useHistorianNotebook';

interface PacManGameProps {
  periodId: string;
  onGameOver: (score: number, won: boolean) => void;
  onBack: () => void;
  skinId?: string;
}

const SKIN_EMOJIS: Record<string, string> = {
  classic: "🟡",
  ghost: "👻",
  knight: "🛡️",
  ninja: "🥷",
  king: "👑",
  astronaut: "👨‍🚀",
};

type PhaseData = {
  periodName: string;
  theme: { wallColor: string; bgColor: string; accentColor: string; atmosphereLabel: string };
  ghosts: Array<{ name: string; emoji: string; description: string; tintColor: string }>;
  collectibles: Array<{ name: string; emoji: string; fact: string }>;
  powerPellets: Array<{ name: string; emoji: string; effect: string }>;
  finalChallenge: { question: string; options: string[]; correctIndex: number; explanation: string };
  periodSummary: string;
};

const BEEP = { DOT: 800, POWERUP: 1200, DEATH: 200, CORRECT: 1000, WRONG: 150, BGM_LOW: 110, BGM_HIGH: 165 };

export default function PacManGame({ periodId, onGameOver, onBack, skinId = "classic" }: PacManGameProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const bgmInterval = useRef<any>(null);
  const phaserSceneRef = useRef<any>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [muted, setMuted] = useState(false);
  const [dotsLeft, setDotsLeft] = useState(0);

  const directionRef = useRef<string | null>(null);
  const handleDirection = (dir: string | null) => { directionRef.current = dir; };

  // No useEffect do Phaser, vamos atualizar o dotsLeft
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(true);

  // Modal states
  const [showCollectible, setShowCollectible] = useState<{ name: string; emoji: string; fact: string } | null>(null);
  const [showGhostInfo, setShowGhostInfo] = useState<{ name: string; emoji: string; description: string } | null>(null);
  const [showPowerPellet, setShowPowerPellet] = useState<{ name: string; emoji: string; effect: string } | null>(null);
  const [showFinalChallenge, setShowFinalChallenge] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showMidGameQuiz, setShowMidGameQuiz] = useState<{ question: string, options: string[], correctIndex: number, explanation: string } | null>(null);

  const { entries, addFact, clearNotebook } = useHistorianNotebook();

  useEffect(() => {
    api.pacman.getPhaseData(periodId)
      .then(data => { setPhaseData(data as PhaseData); })
      .catch(() => setPhaseData(null))
      .finally(() => setLoadingPhase(false));
  }, [periodId]);

  const playBeep = useCallback((freq: number, dur = 0.1, vol = 0.1) => {
    if (muted) return;
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = freq < 300 ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + dur);
      osc.connect(gain); gain.connect(audioCtx.current.destination);
      osc.start(); osc.stop(audioCtx.current.currentTime + dur);
    } catch {}
  }, [muted]);

  useEffect(() => {
    if (bgmInterval.current) clearInterval(bgmInterval.current);
    let step = 0;
    bgmInterval.current = setInterval(() => {
      if (!muted && !showFinalChallenge && !showMidGameQuiz) playBeep(step % 4 === 0 ? BEEP.BGM_LOW : BEEP.BGM_HIGH, 0.05, 0.02);
      step++;
    }, 280);
    return () => { if (bgmInterval.current) clearInterval(bgmInterval.current); };
  }, [muted, showFinalChallenge, showMidGameQuiz, playBeep]);

  useEffect(() => {
    if (!gameContainerRef.current || loadingPhase || !phaseData) return;

    const bg = phaseData.theme.bgColor ?? '#020617';
    const wallHex = parseInt((phaseData.theme.wallColor ?? '#1e3a5f').replace('#', ''), 16);
    const accentHex = parseInt((phaseData.theme.accentColor ?? '#fcd34d').replace('#', ''), 16);

    class MainScene extends Phaser.Scene {
      player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      ghosts!: Phaser.Physics.Arcade.Group;
      dots!: Phaser.Physics.Arcade.Group;
      specialItems!: Phaser.Physics.Arcade.Group;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      
      innerScore = 0;
      innerLives = 3;
      isPowerMode = false;
      collectibleIndex = 0;
      powerPelletIndex = 0;

      constructor() { super({ key: 'MainScene' }); }

      create() {
        phaserSceneRef.current = this;
        this.cursors = this.input.keyboard!.createCursorKeys();
        
        const playerEmojiStr = SKIN_EMOJIS[skinId] || "🟡";
        
        this.player = this.physics.add.sprite(300, 200, 'dot'); 
        this.player.setAlpha(0); 
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(24, 24);

        if (skinId === 'classic') {
          // Criar gráficos para o Pac-Man clássico com boca
          this.playerGraphics = this.add.graphics();
          this.playerEmoji = this.add.text(-100, -100, ""); // Dummy para não quebrar referências
        } else {
          this.playerEmoji = this.add.text(0, 0, playerEmojiStr, { 
            fontSize: '32px',
            padding: { x: 10, y: 10 }
          }).setOrigin(0.5);
        }
        
        if (this.playerEmoji) this.playerEmoji.setDepth(100);
        if (this.playerGraphics) this.playerGraphics.setDepth(100);

        this.cameras.main.setBackgroundColor(bg);
        this.cameras.main.setBounds(0, 0, 800, 800);
        this.cameras.main.setZoom(1.4);
        
        this.createTextures();

        const walls = this.physics.add.staticGroup();
        this.dots = this.physics.add.group();
        this.specialItems = this.physics.add.group();
        this.ghosts = this.physics.add.group();

        const layouts = [
          // Layout 1: Clássico
          [
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
          ],
          // Layout 2: Aberto e Largo
          [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W.WWWW.WW..WW.WWWW.W",
            "W.W....W....W....W.W",
            "W.W.WW.W.GG.W.WW.W.W",
            "W.W..W.W....W.W..W.W",
            "W.WWWW.W.WW.W.WWWW.W",
            "W......W....W......W",
            "WWWW.W.WWWWWW.W.WWWW",
            ".....W...W..W...W...",
            "WWWW.W.WW..WW.W.WWWW",
            "W........P.........W",
            "W.WWWWWW....WWWWWW.W",
            "W.W....W.WW.W....W.W",
            "W.W.WW.W....W.WW.W.W",
            "W.W..W.WW..WW.W..W.W",
            "W.WWWW........WWWW.W",
            "WS.....WW..WW.....SW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
          ],
          // Layout 3: Labirinto Complexo
          [
            "WWWWWWWWWWWWWWWWWWWW",
            "W........WW........W",
            "W.WWW.WW.WW.WW.WWW.W",
            "W.S.W.WW.WW.WW.W.S.W",
            "W.W.W.WW.WW.WW.W.W.W",
            "W...W..........W...W",
            "WWW.W.WWWWWWWW.W.WWW",
            "W...W....WW....W...W",
            "W.WWWWWW.WW.WWWWWW.W",
            "W........GG........W",
            "W.WWWWWW.WW.WWWWWW.W",
            "W...W....WW....W...W",
            "WWW.W.WWWWWWWW.W.WWW",
            "W...W..........W...W",
            "W.W.W.WW.WW.WW.W.W.W",
            "W.S.W.WW.WW.WW.W.S.W",
            "W.WWW.WW.WW.WW.WWW.W",
            "W........P.........W",
            "W.WWWWWWWWWWWWWWWW.W",
            "WWWWWWWWWWWWWWWWWWWW",
          ]
        ];

        const layout = layouts[(level - 1) % layouts.length];
        const tile = 40;
        let totalDots = 0;
        layout.forEach((row, y) => {
          row.split('').forEach((ch, x) => {
            const px = x * tile + 20, py = y * tile + 20;
            if (ch === 'W') walls.create(px, py, 'wall');
            else if (ch === '.') { this.dots.create(px, py, 'dot'); totalDots++; }
            else if (ch === 'S') this.specialItems.create(px, py, 'special');
            else if (ch === 'P') {
              this.player.setPosition(px, py);
            }
            else if (ch === 'G') {
              this.createGhost(px, py);
              // Inimigos extras em níveis altos
              if (level > 1 && Math.random() > 0.5) this.createGhost(px + 40, py);
            }
          });
        });
        setDotsLeft(totalDots);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.physics.add.collider(this.player, walls);
        this.physics.add.collider(this.ghosts, walls);

        this.physics.add.overlap(this.player, this.dots, (_p, dot) => {
          dot.destroy();
          this.innerScore += 10; setScore(this.innerScore);
          const remaining = this.dots.countActive(true);
          setDotsLeft(remaining);
          playBeep(BEEP.DOT, 0.05);
          if (remaining % 15 === 0) {
            const item = phaseData!.collectibles[this.collectibleIndex++ % phaseData!.collectibles.length];
            setShowCollectible(item);
            if (item.fact) addFact({ periodId, periodName: phaseData!.periodName, fact: item.fact, source: '', activityType: 'pacman', emoji: item.emoji });
            setTimeout(() => setShowCollectible(null), 4000);
          }
          if (this.dots.countActive(true) === 0) { this.physics.world.pause(); setShowFinalChallenge(true); }
        });

        this.physics.add.overlap(this.player, this.specialItems, (_p, s: any) => {
          s.destroy();
          this.physics.world.pause();
          playBeep(BEEP.POWERUP, 0.2);
          const pp = phaseData!.powerPellets[this.powerPelletIndex++ % phaseData!.powerPellets.length];
          
          const challenge = pp?.challenge || {
            question: phaseData!.finalChallenge.question,
            options: phaseData!.finalChallenge.options,
            correctIndex: phaseData!.finalChallenge.correctIndex,
            explanation: phaseData!.finalChallenge.explanation
          };

          setShowMidGameQuiz({
            question: `Sobre "${pp?.name || 'Histórico'}": ${challenge.question}`,
            options: challenge.options,
            correctIndex: challenge.correctIndex,
            explanation: challenge.explanation || pp?.effect || ""
          });
          setShowPowerPellet(pp);
        });

        this.physics.add.overlap(this.player, this.ghosts, (_p, ghost: any) => {
          if (this.isPowerMode) {
            const idx = ghost.getData('ghostIndex') ?? 0;
            const gData = phaseData!.ghosts[idx % phaseData!.ghosts.length];
            if (gData) { setShowGhostInfo(gData); setTimeout(() => setShowGhostInfo(null), 3500); }
            ghost.setPosition(400, 400);
            this.innerScore += 200; setScore(this.innerScore);
          } else { this.handleDeath(); }
        });
      }

      createGhost(x: number, y: number) {
        const ghost = this.ghosts.create(x, y, 'ghost') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        const gSpeed = 100 + (level * 15);
        ghost.setCollideWorldBounds(true).setBounce(1).setVelocity(gSpeed, gSpeed);
        const idx = this.ghosts.getChildren().length - 1;
        ghost.setData('ghostIndex', idx);
        const hexStr = phaseData!.ghosts[idx % phaseData!.ghosts.length]?.tintColor ?? '#ef4444';
        ghost.setTint(parseInt(hexStr.replace('#', ''), 16));
        ghost.body.setSize(32, 32);
      }

      activatePowerMode() {
        this.isPowerMode = true;
        this.ghosts.getChildren().forEach((g: any) => g.setTint(0x60a5fa));
        this.time.delayedCall(8000, () => {
          this.isPowerMode = false;
          this.ghosts.getChildren().forEach((g: any, i: number) => {
            const hexStr = phaseData!.ghosts[i % phaseData!.ghosts.length]?.tintColor ?? '#ef4444';
            g.setTint(parseInt(hexStr.replace('#', ''), 16));
          });
        });
      }

      handleDeath() {
        if (!this.player || this.playerEmoji.alpha < 1) return;
        playBeep(BEEP.DEATH, 0.3, 0.2);
        this.innerLives--; setLives(this.innerLives);
        this.cameras.main.shake(300, 0.02);
        if (this.innerLives <= 0) { this.physics.pause(); onGameOver(this.innerScore, false); }
        else {
          // Aplica o efeito de "dano" no Emoji, não no corpo físico
          this.playerEmoji.setAlpha(0.5);
          this.time.delayedCall(2000, () => {
            if (this.playerEmoji) this.playerEmoji.setAlpha(1);
          });
        }
      }

      update() {
        if (!this.player || this.physics.world.isPaused) return;
        
        const speed = 200 + (level * 20);
        let vx = 0, vy = 0;
        let rotation = 0;
        
        if (this.cursors.left.isDown || directionRef.current === 'left') { vx = -speed; rotation = 180; }
        else if (this.cursors.right.isDown || directionRef.current === 'right') { vx = speed; rotation = 0; }
        else if (this.cursors.up.isDown || directionRef.current === 'up') { vy = -speed; rotation = -90; }
        else if (this.cursors.down.isDown || directionRef.current === 'down') { vy = speed; rotation = 90; }

        this.player.setVelocity(vx, vy);

        if (skinId === 'classic' && this.playerGraphics) {
          this.playerGraphics.clear();
          const t = this.time.now / 100;
          const mouthOpen = (vx !== 0 || vy !== 0) ? Math.abs(Math.sin(t)) * 40 : 20;
          
          this.playerGraphics.fillStyle(0xffff00, this.playerEmoji.alpha);
          this.playerGraphics.slice(
            this.player.x, 
            this.player.y, 
            16, 
            Phaser.Math.DegToRad(rotation + mouthOpen), 
            Phaser.Math.DegToRad(rotation + 360 - mouthOpen), 
            false
          );
          this.playerGraphics.fillPath();
        } else {
          this.playerEmoji.setPosition(this.player.x, this.player.y);
          this.playerEmoji.setAngle(rotation);
          
          if (vx !== 0 || vy !== 0) {
            const t = this.time.now / 100;
            const bite = Math.abs(Math.sin(t)) * 0.4;
            this.playerEmoji.setScale(1 + bite * 0.2);
          }
        }

        if (this.player.x < 0) this.player.x = 760;
        else if (this.player.x > 800) this.player.x = 40;
        if (this.player.y < 0) this.player.y = 760;
        else if (this.player.y > 800) this.player.y = 40;

        this.ghosts.getChildren().forEach((g: any, i: number) => {
          const dist = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y);
          
          // O primeiro fantasma (Líder) sempre persegue o player
          // Os outros perseguem se estiverem a menos de 250px
          if (!this.isPowerMode && (i === 0 || dist < 250)) {
            this.physics.moveToObject(g, this.player, 130 + (level * 10));
          } 
          else if (this.isPowerMode) {
            // Se estiver no power mode, eles fogem do player
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, g.x, g.y);
            this.physics.velocityFromRotation(angle, 100, g.body.velocity);
          }
          else if (Math.random() < 0.03) {
            // Movimento de patrulha aleatório
            const angles = [0, 90, 180, 270];
            this.physics.velocityFromAngle(angles[Math.floor(Math.random() * 4)], 110 + (level * 5), g.body.velocity);
          }
        });
      }

      createTextures() {
        const g = this.add.graphics();
        const wallHex = parseInt((phaseData!.theme.wallColor ?? '#1e3a5f').replace('#', ''), 16);
        g.clear().fillStyle(0xffffff).fillRoundedRect(4, 4, 24, 20, { tl: 12, tr: 12, bl: 0, br: 0 })
          .fillCircle(10, 24, 4).fillCircle(16, 24, 4).fillCircle(22, 24, 4)
          .fillStyle(0x000000).fillCircle(10, 12, 2).fillCircle(22, 12, 2).generateTexture('ghost', 32, 32);
        g.clear().fillStyle(0xffffff, 0.8).fillCircle(4, 4, 4).generateTexture('dot', 8, 8);
        
        const accentHex = parseInt((phaseData!.theme.accentColor ?? '#fcd34d').replace('#', ''), 16);
        g.clear().fillStyle(accentHex, 1);
        const starPoints: any[] = [];
        const cx = 16, cy = 16, outerR = 13, innerR = 6;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const ang = (Math.PI / 5) * i - Math.PI / 2;
          starPoints.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
        }
        g.fillPoints(starPoints, true).generateTexture('special', 32, 32);

        g.clear().lineStyle(2, wallHex).strokeRect(2, 2, 36, 36).fillStyle(wallHex, 0.4).fillRect(2, 2, 36, 36).generateTexture('wall', 40, 40);
        g.destroy();
      }
    }

    gameInstance.current = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: gameContainerRef.current,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 800 },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
      scene: MainScene,
    });

    return () => { if (gameInstance.current) { gameInstance.current.destroy(true); gameInstance.current = null; } };
  }, [loadingPhase, phaseData, periodId, skinId]);

  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const handleMidGameAnswer = (idx: number) => {
    if (!showMidGameQuiz) return;
    const correct = idx === showMidGameQuiz.correctIndex;
    
    setFeedback({
      isCorrect: correct,
      explanation: correct ? "Muito bem! Você ganhou Super Poder!" : `Incorreto. A resposta certa era: ${showMidGameQuiz.options[showMidGameQuiz.correctIndex]}`
    });

    if (correct) {
      setScore(s => s + 500);
      phaserSceneRef.current?.activatePowerMode();
      playBeep(BEEP.CORRECT, 0.5, 0.3);
    } else {
      playBeep(BEEP.WRONG, 0.4, 0.2);
    }

    // Fecha o quiz mas mantém o feedback por 2 segundos
    setShowMidGameQuiz(null);
    setShowPowerPellet(null);
    setTimeout(() => {
      setFeedback(null);
      phaserSceneRef.current?.physics.world.resume();
    }, 2500);
  };

  const handleFinalAnswer = (idx: number) => {
    if (!phaseData) return;
    const correct = idx === phaseData.finalChallenge.correctIndex;
    
    setFeedback({
      isCorrect: correct,
      explanation: phaseData.finalChallenge.explanation
    });

    if (correct) {
      setScore(s => s + 1000);
      playBeep(BEEP.CORRECT, 0.5, 0.3);
      setShowFinalChallenge(false);
      setTimeout(() => {
        setFeedback(null);
        setShowLevelUp(true);
        setTimeout(() => {
          setShowLevelUp(false);
          setLevel(l => l + 1);
          phaserSceneRef.current?.scene.restart();
        }, 2000);
      }, 3000);
    } else {
      playBeep(BEEP.WRONG, 0.4, 0.2);
      setShowFinalChallenge(false);
      setTimeout(() => {
        setFeedback(null);
        onGameOver(score, false);
      }, 3000);
    }
  };

  if (loadingPhase) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-950 relative py-4 px-4 overflow-hidden">
      {showNotebook && <HistorianNotebook entries={entries} onClose={() => setShowNotebook(false)} onClear={clearNotebook} />}

      <div className="absolute top-4 left-4 right-4 flex justify-between z-50">
        <div className="flex gap-1 md:gap-2">
          <button onClick={onBack} className="p-1.5 md:p-2 bg-white/5 border border-white/10 text-white rounded-lg md:rounded-xl"><X className="w-4 h-4 md:w-6 md:h-6" /></button>
          <button onClick={() => setMuted(!muted)} className="p-1.5 md:p-2 bg-white/5 border border-white/10 text-white rounded-lg md:rounded-xl">{muted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}</button>
          <button onClick={() => setShowNotebook(true)} className="p-1.5 md:p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg md:rounded-xl"><BookOpen className="w-4 h-4 md:w-6 md:h-6" /></button>
        </div>
        <div className="flex flex-wrap gap-1 md:gap-2 justify-end w-2/3 md:w-auto">
          <div className="bg-slate-900/80 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-emerald-500/30 text-emerald-400 font-black text-[9px] md:text-sm">Faltam: {dotsLeft}</div>
          <div className="bg-slate-900/80 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-blue-500/30 text-blue-400 font-black text-[9px] md:text-sm">Nível {level}</div>
          <div className="bg-slate-900/80 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-amber-400/30 text-white font-black text-[9px] md:text-sm">{score}</div>
          <div className="bg-slate-900/80 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-red-500/30 text-white font-black text-[9px] md:text-sm">{lives} ❤️</div>
        </div>
      </div>

      <h2 className="text-base md:text-xl font-black text-amber-400 uppercase italic mt-16 md:mt-4 mb-2 md:mb-4 tracking-widest text-center">{phaseData?.theme.atmosphereLabel}</h2>

      <div ref={gameContainerRef} className="rounded-[2rem] overflow-hidden border-8 border-slate-900 shadow-2xl bg-slate-900" style={{ width: '100%', maxWidth: '600px', maxHeight: '60vh', aspectRatio: '1/1' }} />

      {/* Controles Mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden z-50">
        <div />
        <button 
          className="w-16 h-16 bg-slate-800/80 rounded-2xl active:bg-amber-500 active:scale-95 flex items-center justify-center text-white border border-slate-600 transition-all touch-none select-none"
          onPointerDown={(e) => { e.preventDefault(); handleDirection('up'); }}
          onPointerUp={(e) => { e.preventDefault(); handleDirection(null); }}
          onPointerLeave={(e) => { e.preventDefault(); handleDirection(null); }}
        ><ArrowUp size={32} /></button>
        <div />
        <button 
          className="w-16 h-16 bg-slate-800/80 rounded-2xl active:bg-amber-500 active:scale-95 flex items-center justify-center text-white border border-slate-600 transition-all touch-none select-none"
          onPointerDown={(e) => { e.preventDefault(); handleDirection('left'); }}
          onPointerUp={(e) => { e.preventDefault(); handleDirection(null); }}
          onPointerLeave={(e) => { e.preventDefault(); handleDirection(null); }}
        ><ArrowLeft size={32} /></button>
        <button 
          className="w-16 h-16 bg-slate-800/80 rounded-2xl active:bg-amber-500 active:scale-95 flex items-center justify-center text-white border border-slate-600 transition-all touch-none select-none"
          onPointerDown={(e) => { e.preventDefault(); handleDirection('down'); }}
          onPointerUp={(e) => { e.preventDefault(); handleDirection(null); }}
          onPointerLeave={(e) => { e.preventDefault(); handleDirection(null); }}
        ><ArrowDown size={32} /></button>
        <button 
          className="w-16 h-16 bg-slate-800/80 rounded-2xl active:bg-amber-500 active:scale-95 flex items-center justify-center text-white border border-slate-600 transition-all touch-none select-none"
          onPointerDown={(e) => { e.preventDefault(); handleDirection('right'); }}
          onPointerUp={(e) => { e.preventDefault(); handleDirection(null); }}
          onPointerLeave={(e) => { e.preventDefault(); handleDirection(null); }}
        ><ArrowRight size={32} /></button>
      </div>

      {showCollectible && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-amber-400 rounded-2xl px-6 py-3 text-center animate-bounce-in z-50 shadow-2xl max-w-[80vw] backdrop-blur-sm">
          <p className="text-2xl mb-1">{showCollectible.emoji}</p>
          <p className="text-xs text-amber-400 font-black uppercase tracking-tighter mb-1">{showCollectible.name}</p>
          <p className="text-sm text-white font-medium leading-tight">{showCollectible.fact}</p>
        </div>
      )}

      {showMidGameQuiz && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] p-6 max-w-md w-full text-center animate-pop">
            <h3 className="text-white font-black mb-6">{showMidGameQuiz.question}</h3>
            <div className="grid grid-cols-1 gap-2">
              {showMidGameQuiz.options.map((opt, i) => (
                <button key={i} onClick={() => handleMidGameAnswer(i)} className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-amber-400 hover:text-slate-950 font-bold text-sm text-left transition-all">{opt}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showFinalChallenge && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-4 border-amber-400 rounded-[3rem] p-8 max-w-xl w-full text-center animate-pop">
            <h3 className="text-white text-xl font-black mb-6">{phaseData?.finalChallenge.question}</h3>
            <div className="grid grid-cols-1 gap-3">
              {phaseData?.finalChallenge.options.map((opt, i) => (
                <button key={i} onClick={() => handleFinalAnswer(i)} className="p-4 bg-slate-800 border-2 border-slate-700 text-white rounded-2xl hover:bg-amber-400 hover:text-slate-950 font-bold text-left transition-all">{opt}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      {feedback && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-[120] p-4 backdrop-blur-lg animate-pop">
          <div className={`bg-slate-900 border-4 ${feedback.isCorrect ? 'border-emerald-500' : 'border-rose-500'} rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl`}>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl ${feedback.isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {feedback.isCorrect ? '✓' : '✗'}
            </div>
            <h3 className={`text-2xl font-black mb-4 ${feedback.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {feedback.isCorrect ? 'CORRETO!' : 'OPS, INCORRETO!'}
            </h3>
            <p className="text-white text-lg font-medium leading-relaxed mb-4">
              {feedback.explanation}
            </p>
          </div>
        </div>
      )}

      {showLevelUp && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-[110] backdrop-blur-sm animate-pop">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-amber-400 italic tracking-tighter mb-2">NÍVEL CONCLUÍDO!</h1>
            <p className="text-white text-lg md:text-xl font-bold uppercase tracking-widest">Preparando Nível {level + 1}...</p>
          </div>
        </div>
      )}
    </div>
  );
}
