import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WebsiteCard from "@/components/websites/WebsiteCard";
import { Plus, Globe } from "lucide-react";

const categories = ["all", "business", "ecommerce", "portfolio", "blog", "landing_page", "restaurant", "agency", "saas", "local_service", "other"];

export default function WebsiteLibrary() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const query = category === "all" ? {} : { category };
        const page = await base44.entities.Website.filter(query, { sort: "-created_date", limit: 50 });
        setWebsites(page.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Website Library</h1>
          <p className="text-muted-foreground">GPT-created websites, categorized and ready to launch</p>
        </div>
        <Link to="/packs">
          <Button>
            <Plus className="w-4 h-4" />
            Create from Pack
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat === "all" ? "All Categories" : cat.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No websites yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Approve a pack from GPT to create your first website</p>
          <Link to="/packs">
            <Button variant="outline">Go to Pack Review</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {websites.map((site) => (
            <WebsiteCard key={site.id} website={site} />
          ))}
        </div>
      )}
    </div>
  );
}