import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryStyles = {
  business: "bg-blue-100 text-blue-700",
  ecommerce: "bg-green-100 text-green-700",
  portfolio: "bg-purple-100 text-purple-700",
  blog: "bg-orange-100 text-orange-700",
  landing_page: "bg-pink-100 text-pink-700",
  restaurant: "bg-yellow-100 text-yellow-700",
  agency: "bg-indigo-100 text-indigo-700",
  saas: "bg-cyan-100 text-cyan-700",
  local_service: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-700",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-green-100 text-green-700",
  published: "bg-blue-100 text-blue-700",
};

export default function WebsiteCard({ website, onClick }) {
  const previewSrc = website.preview_html
    ? `data:text/html;charset=utf-8,${encodeURIComponent(website.preview_html)}`
    : null;

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick?.(website)}>
      <div className="aspect-video bg-muted overflow-hidden border-b border-border">
        {previewSrc ? (
          <iframe
            src={previewSrc}
            className="w-full h-full border-0 pointer-events-none"
            title={`Preview of ${website.name}`}
            sandbox=""
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No preview available
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm truncate">{website.name}</h3>
          <Badge variant="secondary" className={`text-xs capitalize shrink-0 ${categoryStyles[website.category] || categoryStyles.other}`}>
            {(website.category || "other").replace("_", " ")}
          </Badge>
        </div>
        {website.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{website.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <Badge variant="outline" className={`text-xs capitalize ${statusStyles[website.status] || statusStyles.draft}`}>
            {website.status || "draft"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}