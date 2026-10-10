import React from "react";
import { Phone, MapPin, Globe, Headphones } from "lucide-react";

export default function LaunchCTA() {
  return (
    <section id="pricing" className="bg-gradient-to-r from-[#007bff] to-[#0056d2] py-14 px-4 sm:px-6 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to Launch? Call Us Now.</h2>
        <p className="text-white/80 mb-6">Get your industry website live this week.</p>
        <a href="tel:8015550123" className="inline-flex items-center gap-2 bg-white text-[#007bff] font-bold rounded-full px-8 py-3 text-lg hover:bg-slate-100 transition-colors mb-8">
          <Phone className="w-5 h-5" /> (801) 555-0123
        </a>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Utah Based · Nationwide</span>
          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Nationwide Reach</span>
          <span className="flex items-center gap-2"><Headphones className="w-4 h-4" /> Dedicated Support</span>
        </div>
      </div>
    </section>
  );
}