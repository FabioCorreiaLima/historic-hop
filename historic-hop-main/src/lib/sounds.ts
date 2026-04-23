// Sound effects using Web Audio API - no external files needed
const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  if (!audioCtx) return;
  try {
    audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}

export function playCorrectSound() {
  playTone(523, 0.1, "sine", 0.12);
  setTimeout(() => playTone(659, 0.1, "sine", 0.12), 80);
  setTimeout(() => playTone(784, 0.15, "sine", 0.15), 160);
}

export function playWrongSound() {
  playTone(200, 0.15, "square", 0.08);
  setTimeout(() => playTone(180, 0.2, "square", 0.06), 120);
}

export function playLevelUpSound() {
  [523, 587, 659, 784, 880].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sine", 0.1), i * 80);
  });
}

export function playClickSound() {
  playTone(440, 0.05, "sine", 0.06);
}

export function playAchievementSound() {
  [784, 988, 1175, 1319].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "triangle", 0.12), i * 100);
  });
}
