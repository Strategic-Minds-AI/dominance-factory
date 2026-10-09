import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Rocket, Loader2, Upload, Search } from "lucide-react";

export default function CampaignForm({ open, onClose, onLaunched }) {
  const [name, setName] = useState("");
  const [locationsText, setLocationsText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [websites, setWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [websiteNames, setWebsiteNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [websiteSearch, setWebsiteSearch] = useState("");
  const fileInputRef = useRef(null);
  const serviceFileRef = useRef(null);

  useEffect(() => {
    if (open) {
      async function loadWebsites() {
        try {
          const page = await base44.entities.Website.filter(
            { status: { $in: ["approved", "published"] } },
            { limit: 200, fields: ["id", "name", "category", "description"] }
          );
          setWebsites(page.items || []);
        } catch (e) {
          console.error(e);
        }
      }
      loadWebsites();
    }
  }, [open]);

  const parseFile = (text) => {
    const lines = text.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
    // If it looks like CSV (has commas), take the first column
    return lines.map((l) => l.split(",")[0].trim()).filter((l) => l.length > 0).join("\n");
  };

  const handleLocationUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setLocationsText(parseFile(event.target.result));
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleServiceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setServicesText(parseFile(event.target.result));
    reader.readAsText(file);
    e.target.value = "";
  };

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
        website_names: websiteNames,
      });
      setName("");
      setLocationsText("");
      setServicesText("");
      setSelectedWebsites([]);
      setWebsiteNames({});
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

  const filteredWebsites = websites.filter((w) =>
    w.name.toLowerCase().includes(websiteSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
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
              placeholder="e.g. Texas Plumbing Pages — Q4 2026"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="locations">Locations (one per line)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs mb-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" /> Upload CSV
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleLocationUpload}
                />
              </div>
              <Textarea
                id="locations"
                value={locationsText}
                onChange={(e) => setLocationsText(e.target.value)}
                placeholder={"Austin, TX\nDallas, TX\nHouston, TX\nSan Antonio, TX\nFort Worth, TX\nEl Paso, TX\nArlington, TX\nCorpus Christi, TX\nLubbock, TX\nLaredo, TX"}
                className="mt-1 min-h-[350px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{locationCount.toLocaleString()} locations</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="services">Services (one per line)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs mb-1"
                  onClick={() => serviceFileRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" /> Upload CSV
                </Button>
                <input
                  ref={serviceFileRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleServiceUpload}
                />
              </div>
              <Textarea
                id="services"
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                placeholder={"Plumbing\nWater Heater Repair\nDrain Cleaning\nLeak Detection\nSewer Line Repair\nGarbage Disposal\nBathroom Remodeling\nEmergency Plumbing"}
                className="mt-1 min-h-[350px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{serviceCount.toLocaleString()} services</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Website Templates ({selectedWebsites.length} selected)</Label>
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={websiteSearch}
                  onChange={(e) => setWebsiteSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="h-7 text-xs pl-7 w-48"
                />
              </div>
            </div>
            <div className="mt-1 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {websites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approved websites. Approve a pack first.</p>
              ) : filteredWebsites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matches.</p>
              ) : (
                filteredWebsites.map((w) => (
                  <div key={w.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedWebsites.includes(w.id)}
                      onCheckedChange={() => toggleWebsite(w.id)}
                      id={`ws-${w.id}`}
                    />
                    <label htmlFor={`ws-${w.id}`} className="text-sm cursor-pointer flex-1">
                      {w.name} <span className="text-muted-foreground">({w.category})</span>
                    </label>
                    {selectedWebsites.includes(w.id) && (
                      <Input
                        type="text"
                        value={websiteNames[w.id] || ""}
                        onChange={(e) => setWebsiteNames({ ...websiteNames, [w.id]: e.target.value })}
                        placeholder="Custom label (optional)"
                        className="h-7 text-xs w-40"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <div>
              <span className="text-sm text-muted-foreground">Total pages to generate</span>
              <p className="text-xs text-muted-foreground mt-0.5">{locationCount.toLocaleString()} locations × {serviceCount.toLocaleString()} services × {selectedWebsites.length} websites</p>
            </div>
            <span className="text-3xl font-bold tabular-nums">{totalCount.toLocaleString()}</span>
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