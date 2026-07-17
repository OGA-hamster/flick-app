"use client";

export default function LivelyBackground() {
  return (
    <div className="lively-bg-wrapper">
      <video
        className="lively-bg-video"
        autoPlay
        loop
        muted
        playsInline
        src="/background.mp4"
      />
      <div className="lively-bg-overlay" />
    </div>
  );
}