let audioCtx: AudioContext | null = null;

/**
 * Plays a short tone matching the element's value.
 * @param value The value of the element being sorted
 * @param maxVal The maximum value in the array to calculate the frequency ratio
 * @param volume The volume level between 0 and 1
 * @param isMuted Whether the audio is currently muted
 */
export function playSortSound(value: number, maxVal: number, volume: number, isMuted: boolean) {
  if (isMuted || volume <= 0) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Map value (usually 5 to 105) to a clean audible frequency range (150Hz to 850Hz)
    const minFreq = 150;
    const maxFreq = 850;
    const ratio = Math.min(Math.max(value / maxVal, 0), 1);
    const frequency = minFreq + ratio * (maxFreq - minFreq);

    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.type = 'sine'; // Sine wave is smooth, clean, and retro

    // Set gain with envelope to prevent audio click artifacts
    gainNode.gain.setValueAtTime(volume * 0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (err) {
    console.warn('Web Audio API is not supported or was blocked:', err);
  }
}
