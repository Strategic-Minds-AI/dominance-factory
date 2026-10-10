import React from "react";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const QUICK_LINKS = ["Industries", "Templates", "How It Works", "Pricing", "Contact"];
const TOP_INDUSTRIES = ["Legal", "Real Estate", "HVAC", "Roofing", "Dental", "Med Spa"];

export default function LaunchFooter() {
  return (
    <footer id="contact" className="bg-[#0a101d] text-slate-400 pt-14 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#007bff] flex items-center justify-center font-black text-white text-lg">W</div>
            <span className="font-bold text-white">Website Launch Engine</span>
          </div>
          <p className="text-sm">Fast, conversion-focused websites for high-value industries — at scale.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[#007bff] transition-colors">{l}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Top Industries</h4>
          <ul className="space-y-2 text-sm">
            {TOP_INDUSTRIES.map(l => <li key={l}><a href="#industries" className="hover:text-[#007bff] transition-colors">{l}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#007bff]" /> (801) 555-0123</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#007bff]" /> hello@weblaunchengine.com</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#007bff]" /> Salt Lake City, UT</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#007bff]" /> Mon–Fri 8am–6pm MT</li>
          </ul>
          <div className="flex gap-3 mt-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#007bff] flex items-center justify-center transition-colors"><Icon className="w-4 h-4" /></a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 text-center text-xs">
        © 2026 Website Launch Engine. All rights reserved.
      </div>
    </footer>
  );
}