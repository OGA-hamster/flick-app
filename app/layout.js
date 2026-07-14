import "./globals.css";
import FloatingChatButton from "@/components/FloatingChatButton";
import LivelyBackground from "@/components/LivelyBackground";

export const metadata = {
  title: "Flick — One dare a day. Zero decisions.",
  description:
    "Flick removes the choice. Every day you get 3 tiny dares. Swipe, do it, keep your streak alive.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <LivelyBackground />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <FloatingChatButton />
      </body>
    </html>
  );
}