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
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="lively-bg-overlay" />
    </div>
  );
}