import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const platformStyles = {
  facebook: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  twitter: "bg-sky-100 text-sky-700",
  linkedin: "bg-indigo-100 text-indigo-700",
  tiktok: "bg-gray-100 text-gray-700",
  youtube: "bg-red-100 text-red-700",
  all: "bg-purple-100 text-purple-700",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-amber-100 text-amber-700",
  posting: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function SocialPostCard({ post }) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs capitalize">{post.category}</Badge>
        <Badge variant="outline" className={`text-xs capitalize ${platformStyles[post.platform] || platformStyles.all}`}>
          {post.platform}
        </Badge>
      </div>
      <h3 className="font-semibold text-sm">{post.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{post.content}</p>
      <div className="flex items-center justify-between pt-1">
        <Badge variant="outline" className={`text-xs ${statusStyles[post.status] || statusStyles.draft}`}>
          {post.status}
        </Badge>
        {post.scheduled_at && (
          <span className="text-xs text-muted-foreground">
            {new Date(post.scheduled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </Card>
  );
}