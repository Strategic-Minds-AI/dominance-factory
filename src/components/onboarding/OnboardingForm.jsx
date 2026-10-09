import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight, Building2, RefreshCw } from "lucide-react";

const FIELDS = [
  { key: "full_name", label: "Full Name", type: "text", placeholder: "John Smith" },
  { key: "phone", label: "Phone Number", type: "tel", placeholder: "(555) 123-4567" },
  { key: "email", label: "Email Address", type: "email", placeholder: "john@business.com" },
  { key: "business_address", label: "Business Address", type: "text", placeholder: "123 Main St, Dallas, TX 75201" },
];

const BUSINESS_TYPES = [
  { value: "new_business", label: "New Business / Website" },
  { value: "ai_enhanced", label: "AI-Enhanced Business / Website" },
  { value: "rebrand", label: "Rebrand Business / Website" },
];

export default function OnboardingForm({ data, onChange, context, onComplete }) {
  const [aiLoading, setAiLoading] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});

  const handleAIComplete = async (fieldKey) => {
    setAiLoading(fieldKey);
    try {
      const res = await base44.functions.invoke("onboardingAI", {
        action: "complete",
        field: fieldKey,
        partialText: data[fieldKey] || "",
        context,
      });
      const suggestions = res?.suggestions || res?.data?.suggestions || [];
      setAiSuggestions({ ...aiSuggestions, [fieldKey]: suggestions });
      setShowSuggestions({ ...showSuggestions, [fieldKey]: true });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(null);
    }
  };

  const pickSuggestion = (fieldKey, value) => {
    onChange({ ...data, [fieldKey]: value });
    setShowSuggestions({ ...showSuggestions, [fieldKey]: false });
  };

  const canComplete = data.full_name && data.phone && data.email && data.business_address && data.business_type;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white">Step 1: AI-Assisted Onboarding</h2>
        <p className="text-sm text-white/50 mt-1">
          Tell us about you and your business. Click the AI button on any field for intelligent suggestions.
        </p>
      </div>

      {FIELDS.map((field) => (
        <div key={field.key}>
          <div className="flex items-center justify-between">
            <Label className="text-white">{field.label}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs mb-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              onClick={() => handleAIComplete(field.key)}
              disabled={aiLoading === field.key}
            >
              {aiLoading === field.key ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1" />
              )}
              AI Assist
            </Button>
          </div>
          <Input
            type={field.type}
            value={data[field.key] || ""}
            onChange={(e) => onChange({ ...data, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="bg-zinc-900 border-white/10 text-white"
          />
          {showSuggestions[field.key] && aiSuggestions[field.key]?.length > 0 && (
            <div className="mt-2 space-y-1">
              {aiSuggestions[field.key].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickSuggestion(field.key, s)}
                  className="block w-full text-left text-sm px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-200 hover:bg-blue-500/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div>
        <Label className="text-white">Business Type</Label>
        <Select
          value={data.business_type || ""}
          onValueChange={(v) => onChange({ ...data, business_type: v })}
        >
          <SelectTrigger className="bg-zinc-900 border-white/10 text-white mt-1">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((bt) => (
              <SelectItem key={bt.value} value={bt.value}>
                {bt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onComplete}
          disabled={!canComplete}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          Continue to Vision
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}