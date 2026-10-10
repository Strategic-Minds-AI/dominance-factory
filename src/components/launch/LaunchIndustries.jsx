import React from "react";
import { ArrowUpRight } from "lucide-react";

const INDUSTRIES = [
  "Legal", "Real Estate", "Epoxy Flooring", "Roofing", "HVAC",
  "Plumbing", "Electrical", "Med Spa", "Dental", "Chiropractic",
  "Remodeling", "Landscaping", "Solar", "Pest Control", "Moving",
  "Auto Detailing", "Restaurants", "Insurance", "Mortgage", "Cleaning Services",
];

const THUMBS = [
  "https://images.unsplash.com/photo-1589829545856-d99d2f488f1c?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564013799925-c95b9211b321?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1632685068429-8b3f5f5e8e1e?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af08?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607472586893-edb46b1a0c1d?w=300&auto=format&fit=crop",
];

export default function LaunchIndustries() {
  return (
    <section id="industries" className="bg-white py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-[#0a101d] text-center mb-2">Top 20 Industries</h2>
        <p className="text-slate-500 text-center mb-10">Pick your industry and launch in minutes.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDUSTRIES.map((name, i) => (
            <div key={name} className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <img src={THUMBS[i % THUMBS.length]} alt={name} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a101d]/90 via-[#0a101d]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <span className="text-white font-bold text-sm">{name}</span>
                <div className="w-7 h-7 rounded-full bg-[#007bff] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-4 h-4 text-white" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}