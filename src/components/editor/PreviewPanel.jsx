import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, Code, Eye, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const deviceWidths = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function PreviewPanel({ html, onSave, saving }) {
  const [device, setDevice] = useState("desktop");
  const [view, setView] = useState("visual");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-background">
        <div className="flex items-center gap-1">
          <Button
            variant={view === "visual" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("visual")}
          >
            <Eye className="w-4 h-4" />
            Visual
          </Button>
          <Button
            variant={view === "code" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("code")}
          >
            <Code className="w-4 h-4" />
            Code
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {view === "visual" && (
            <>
              <Button
                variant={device === "desktop" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={device === "tablet" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={device === "mobile" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </>
          )}
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={saving} className="ml-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/30 p-4 flex justify-center">
        {view === "visual" ? (
          <div
            className="bg-white rounded-md shadow-sm transition-all h-full"
            style={{ width: deviceWidths[device], maxWidth: "100%" }}
          >
            <iframe
              srcDoc={html}
              title="Preview"
              className="w-full h-full border-0 rounded-md"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <pre className="w-full h-full overflow-auto text-xs font-mono bg-background rounded-md border border-border p-4 whitespace-pre-wrap">
            {html}
          </pre>
        )}
      </div>
    </div>
  );
}