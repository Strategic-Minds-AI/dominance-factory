import React from "react";

const TEMPLATES = [
  { title: "High-Call Legal Funnel", desc: "Conversion-optimized for personal injury & estate law.", img: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=500&auto=format&fit=crop" },
  { title: "Luxury Real Estate", desc: "Elegant listings with lead capture built in.", img: "https://images.unsplash.com/photo-1564013799925-c95b9211b321?w=500&auto=format&fit=crop" },
  { title: "HVAC Service Pro", desc: "Book-online flow for emergency service calls.", img: "https://images.unsplash.com/photo-1632685068429-8b3f5f5e8e1e?w=500&auto=format&fit=crop" },
  { title: "Med Spa Aesthetics", desc: "Beautiful galleries and consultation booking.", img: "https://images.unsplash.com/photo-1629909613654-cb50dddf4d8d?w=500&auto=format&fit=crop" },
  { title: "Roofing Authority", desc: "Trust-building layout with instant quote form.", img: "https://images.unsplash.com/photo-1581094794329-c8112a89af08?w=500&auto=format&fit=crop" },
  { title: "Dental Practice", desc: "New patient focused with online scheduling.", img: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=500&auto=format&fit=crop" },
];

export default function LaunchTemplates() {
  return (
    <section id="templates" className="bg-[#f8f9fa] py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-[#0a101d] text-center mb-2">Explore Templates</h2>
        <p className="text-slate-500 text-center mb-10">Modern, mobile-optimized, and ready to launch.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map(t => (
            <div key={t.title} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden border-b border-slate-100">
                <img src={t.img} alt={t.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#0a101d] mb-1">{t.title}</h3>
                <p className="text-sm text-slate-500">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}