export async function playBPP128AfskAudio(buffer: Uint8Array): Promise<void> {
  if (typeof window === "undefined") return;
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  const sampleRate = audioCtx.sampleRate;
  const baudRate = 1200;
  const samplesPerBit = Math.round(sampleRate / baudRate);

  // Frame: 16-bit Preamble (Mark = 1) + [1 Start (0) + 8 Data (LSB) + 1 Stop (1)] per byte
  const bits: number[] = [];
  for (let i = 0; i < 16; i++) bits.push(1);
  for (const byte of buffer) {
    bits.push(0); // Start bit
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1); // 8 Data bits (LSB)
    bits.push(1); // Stop bit
  }

  const audioBuffer = audioCtx.createBuffer(1, bits.length * samplesPerBit, sampleRate);
  const data = audioBuffer.getChannelData(0);

  let phase = 0;
  let idx = 0;
  for (const bit of bits) {
    const freq = bit === 1 ? 1200 : 2200;
    const phaseInc = (2 * Math.PI * freq) / sampleRate;
    for (let s = 0; s < samplesPerBit; s++) {
      data[idx++] = Math.sin(phase) * 0.4; // Continuous Phase FSK
      phase += phaseInc;
    }
  }

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
}
