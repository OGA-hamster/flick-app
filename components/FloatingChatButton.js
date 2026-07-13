"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingChatButton() {
  const pathname = usePathname();

  if (pathname === "/chat") {
    return null;
  }

  return (
    <Link
      href="/chat"
      aria-label="Open AI Chat"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        width: "64px",
        height: "64px",
        borderRadius: "9999px",
        backgroundColor: "#D9FF3F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        fontSize: "28px",
        textDecoration: "none",
      }}
    >
      💬
    </Link>
  );
}