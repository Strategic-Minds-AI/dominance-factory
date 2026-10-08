import React from "react";

const SHELL_URL = "https://vision-cortex-chatgpt-parity-previe.vercel.app";

export default function DominanceShell() {
  return (
    <iframe
      src={SHELL_URL}
      title="Digital Dominance 2.0"
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      allow="clipboard-read; clipboard-write"
    />
  );
}