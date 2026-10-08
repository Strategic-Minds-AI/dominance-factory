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
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2 bg-neutral-950">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("visual")}
            className={cn(
              "text-sm",
              view === "visual"
                ? "bg-white text-black hover:bg-neutral-200"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <Eye className="w-4 h-4" />
            Visual
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("code")}
            className={cn(
              "text-sm",
              view === "code"
                ? "bg-white text-black hover:bg-neutral-200"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <Code className="w-4 h-4" />
            Code
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {view === "visual" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  device === "desktop"
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  device === "tablet"
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                onClick={() => setDevice("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  device === "mobile"
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </>
          )}
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="ml-2 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-neutral-900 p-4 flex justify-center">
        {view === "visual" ? (
          <div
            className="bg-white rounded-md shadow-2xl transition-all h-full"
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
          <pre className="w-full h-full overflow-auto text-xs font-mono bg-neutral-950 text-neutral-300 rounded-md border border-neutral-800 p-4 whitespace-pre-wrap">
            {html}
          </pre>
        )}
      </div>
    </div>
  );
}