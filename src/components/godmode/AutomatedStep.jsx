import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AutomatedStep({ stepNum, stepLabel, stepDesc, status, output, onDone }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "complete" && onDone) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [status, onDone]);

  const isRunning = status === "running";
  const isComplete = status === "complete";
  const isError = status === "error";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
            isComplete ? "border-cyan-400 bg-cyan-500/20" : isError ? "border-red-500 bg-red-500/10" : "border-cyan-400 bg-[#0d141e] animate-pulse"
          }`}>
            {isComplete ? <CheckCircle2 className="w-7 h-7 text-cyan-300" /> : isError ? <AlertCircle className="w-7 h-7 text-red-400" /> : <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />}
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-cyan-400 font-bold">STEP {stepNum} / 8</p>
            <h2 className="text-2xl font-bold text-white">{stepLabel}</h2>
            <p className="text-sm text-slate-400">{stepDesc}</p>
          </div>
        </div>

        {isRunning && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Processing autonomously...</span>
              <span className="text-cyan-400 font-mono">{elapsed}s</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {isComplete && output && (
          <div className="bg-[#05070a] rounded-xl border border-slate-800 p-5">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{typeof output === "string" ? output : JSON.stringify(output, null, 2)}</pre>
          </div>
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <p className="text-red-300 text-sm font-medium mb-1">Step encountered an error.</p>
            <p className="text-slate-400 text-sm mb-2">
              {typeof output === "string" && output.includes("integration credit")
                ? "The workspace is currently out of Base44 integration credits. This step routes through the Vercel AI Gateway and should work independently — if the error persists, check the VERCEL_AI_GATEWAY_API_KEY secret."
                : "This step runs through the Vercel AI Gateway (independent of Base44 integration credits). See the error details below."}
            </p>
            {typeof output === "string" && (
              <pre className="text-xs text-red-300/70 whitespace-pre-wrap font-mono mt-2 max-h-32 overflow-y-auto">{output}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}