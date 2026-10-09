import React, { useState } from "react";
import { LayoutGrid, Check, ArrowRight } from "lucide-react";

const MOCKUPS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Design ${String.fromCharCode(65 + i)}`,
  style: ["Modern Minimal", "Bold Corporate", "Tech Forward", "Warm Service", "Luxury Dark", "Clean Grid", "Vibrant Gradient", "Editorial", "Startup Bold", "Enterprise"][i],
  gradient: ["from-cyan-600 to-blue-700", "from-purple-600 to-indigo-700", "from-emerald-600 to-teal-700", "from-orange-600 to-red-700", "from-slate-700 to-slate-900", "from-blue-600 to-cyan-700", "from-pink-600 to-rose-700", "from-amber-600 to-orange-700", "from-violet-600 to-purple-700", "from-sky-600 to-blue-800"][i],
}));

export default function SelectionStep({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-4">
          <LayoutGrid className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Pick Your Design</h2>
        <p className="text-slate-400">10 mockups generated from your vision. Choose one to provision.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {MOCKUPS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
              selected === m.id ? "border-cyan-400 scale-105 shadow-lg shadow-cyan-500/30" : "border-slate-800 hover:border-slate-600"
            }`}
          >
            <div className={`h-32 bg-gradient-to-br ${m.gradient} flex items-center justify-center`}>
              <span className="text-4xl font-black text-white/30">{m.name.charAt(6)}</span>
            </div>
            <div className="p-3 bg-[#0d141e]">
              <p className="text-xs font-bold text-white">{m.name}</p>
              <p className="text-[10px] text-slate-500">{m.style}</p>
            </div>
            {selected === m.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#05070a]" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => onSelect(MOCKUPS.find((m) => m.id === selected))}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[#05070a] font-bold hover:scale-105 transition-transform"
          >
            Provision This Design <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}