import React, { useState } from "react";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const NAV = [
  { label: "Industries", href: "#industries" },
  { label: "Templates", href: "#templates" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function LaunchHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[#0a101d] text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#007bff] flex items-center justify-center font-black text-white text-lg">W</div>
          <span className="font-bold text-sm sm:text-base tracking-tight">Website Launch Engine</span>
        </div>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map(n => <a key={n.label} href={n.href} className="text-sm text-slate-300 hover:text-[#007bff] transition-colors">{n.label}</a>)}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" /> Utah Based · Nationwide</span>
          <a href="tel:8015550123" className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] transition-colors text-white text-sm font-semibold rounded-full px-4 py-2">
            <Phone className="w-4 h-4" /> (801) 555-0123
          </a>
        </div>
        <button className="lg:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/5 px-4 py-4 space-y-3">
          {NAV.map(n => <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="block text-sm text-slate-300">{n.label}</a>)}
          <a href="tel:8015550123" className="flex items-center gap-2 bg-[#007bff] text-white text-sm font-semibold rounded-full px-4 py-2 w-fit">
            <Phone className="w-4 h-4" /> (801) 555-0123
          </a>
        </div>
      )}
    </header>
  );
}