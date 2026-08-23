export function drawWaveform(canvas, audioData = [], isRecording = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const barWidth = 3;
  const gap = 2;
  const totalBars = Math.floor(width / (barWidth + gap));

  ctx.fillStyle = isRecording ? '#6366f1' : '#475569';

  for (let i = 0; i < totalBars; i++) {
    let barHeight;
    if (isRecording) {
      // Live dynamic animation
      const val = audioData[i % audioData.length] || Math.sin(Date.now() / 150 + i) * 0.5 + 0.5;
      barHeight = Math.max(4, val * (height * 0.85));
    } else {
      // Calm static wave
      const val = Math.sin(i * 0.15) * 0.3 + 0.4;
      barHeight = val * (height * 0.6);
    }

    const x = i * (barWidth + gap);
    const y = (height - barHeight) / 2;
    const radius = 1.5;

    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [radius]);
    ctx.fill();
  }
}
