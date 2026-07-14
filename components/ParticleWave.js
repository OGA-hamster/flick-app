"use client";

import { useEffect, useRef } from "react";

export default function ParticleWave() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width, height;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = 90;
    const rows = 36;
    let time = 0;

    const lerpColor = (t) => {
      // 0 = blue, 0.5 = purple, 1 = coral
      const c1 = [60, 140, 255];   // blue
      const c2 = [170, 90, 230];   // purple
      const c3 = [255, 100, 90];   // coral
      let r, g, b;
      if (t < 0.5) {
        const f = t / 0.5;
        r = c1[0] + (c2[0] - c1[0]) * f;
        g = c1[1] + (c2[1] - c1[1]) * f;
        b = c1[2] + (c2[2] - c1[2]) * f;
      } else {
        const f = (t - 0.5) / 0.5;
        r = c2[0] + (c3[0] - c2[0]) * f;
        g = c2[1] + (c3[1] - c2[1]) * f;
        b = c2[2] + (c3[2] - c2[2]) * f;
      }
      return `${r | 0}, ${g | 0}, ${b | 0}`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.006;

      for (let y = 0; y < rows; y++) {
        const ny = y / rows;
        // concentrate the wave in the lower half, like a horizon
        const baseY = height * 0.55 + ny * height * 0.5;

        for (let x = 0; x < cols; x++) {
          const nx = x / cols;

          const wave =
            Math.sin(nx * 8 + time * 2 + ny * 3) * 22 * (1 - ny * 0.6) +
            Math.sin(nx * 3 - time * 1.3) * 14;

          const px = nx * width;
          const py = baseY + wave - ny * 90;

          if (py < 0 || py > height) continue;

          const depthFade = 1 - ny * 0.75;
          const t = (Math.sin(nx * 5 + time * 0.8) + 1) / 2;
          const color = lerpColor(t);

          const size = 0.8 + depthFade * 2.6;
          const alpha = 0.25 + depthFade * 0.75;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.shadowColor = `rgba(${color}, 0.9)`;
          ctx.shadowBlur = 6 + depthFade * 10;
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}