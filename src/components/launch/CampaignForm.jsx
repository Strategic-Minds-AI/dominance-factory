import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Rocket, Loader2 } from "lucide-react";

export default function CampaignForm({ open, onClose, onLaunched }) {
  const [name, setName] = useState("");
  const [locationsText, setLocationsText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [websites, setWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      async function loadWebsites() {
        try {
          const page = await base44.entities.Website.filter(
            { status: { $in: ["approved", "published"] } },
            { limit: 100, fields: ["id", "name", "category"] }
          );
          setWebsites(page.items || []);
        } catch (e) {
          console.error(e);
        }
      }
      loadWebsites();
    }
  }, [open]);

  const locationCount = locationsText.split("\n").filter((s) => s.trim().length > 0).length;
  const serviceCount = servicesText.split("\n").filter((s) => s.trim().length > 0).length;
  const totalCount = locationCount * serviceCount * selectedWebsites.length;

  const handleLaunch = async () => {
    if (!name.trim()) return setError("Campaign name is required");
    if (locationCount === 0) return setError("At least one location is required");
    if (serviceCount === 0) return setError("At least one service is required");
    if (selectedWebsites.length === 0) return setError("Select at least one website template");

    setLoading(true);
    setError("");
    try {
      await base44.functions.invoke("launchCampaign", {
        name: name.trim(),
        locations_text: locationsText,
        services_text: servicesText,
        website_ids: selectedWebsites,
      });
      setName("");
      setLocationsText("");
      setServicesText("");
      setSelectedWebsites([]);
      onLaunched();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  };

  const toggleWebsite = (id) => {
    setSelectedWebsites((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            New Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Texas Plumbing Pages"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locations">Locations (one per line)</Label>
              <Textarea
                id="locations"
                value={locationsText}
                onChange={(e) => setLocationsText(e.target.value)}
                placeholder={"Austin, TX\nDallas, TX\nHouston, TX\nSan Antonio, TX"}
                className="mt-1 min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{locationCount} locations</p>
            </div>
            <div>
              <Label htmlFor="services">Services (one per line)</Label>
              <Textarea
                id="services"
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                placeholder={"Plumbing\nWater Heater Repair\nDrain Cleaning\nLeak Detection"}
                className="mt-1 min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{serviceCount} services</p>
            </div>
          </div>

          <div>
            <Label>Website Templates</Label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {websites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approved websites. Approve a pack first.</p>
              ) : (
                websites.map((w) => (
                  <div key={w.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedWebsites.includes(w.id)}
                      onCheckedChange={() => toggleWebsite(w.id)}
                      id={`ws-${w.id}`}
                    />
                    <label htmlFor={`ws-${w.id}`} className="text-sm cursor-pointer">
                      {w.name} <span className="text-muted-foreground">({w.category})</span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">Total pages to generate</span>
            <span className="text-2xl font-bold tabular-nums">{totalCount.toLocaleString()}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={loading || totalCount === 0}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Launch {totalCount > 0 && `(${totalCount.toLocaleString()} pages)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}