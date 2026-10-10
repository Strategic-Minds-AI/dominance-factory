import React from "react";
import { Search, FileText, Settings, Rocket } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Choose Industry", desc: "Select from 20+ high-value verticals." },
  { icon: FileText, title: "Pick a Template", desc: "Browse conversion-tested designs." },
  { icon: Settings, title: "Customize Fast", desc: "Add your brand, content, and offers." },
  { icon: Rocket, title: "Launch & Get Calls", desc: "Go live and start generating leads." },
];

export default function LaunchProcess() {
  return (
    <section id="how-it-works" className="bg-white py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-[#0a101d] text-center mb-12">How It Works</h2>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-slate-200" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#007bff] flex items-center justify-center text-white shadow-lg z-10 mb-4">
                <s.icon className="w-6 h-6" />
              </div>
              <span className="text-[#007bff] font-bold text-xs mb-1">STEP {i + 1}</span>
              <h3 className="font-bold text-[#0a101d] mb-1">{s.title}</h3>
              <p className="text-sm text-slate-500 max-w-[200px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}