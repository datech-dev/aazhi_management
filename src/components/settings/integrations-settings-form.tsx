"use client";

import { useState } from "react";
import { updateBusinessSettingsAction } from "@/actions/settings.actions";
import { toast } from "sonner";
import { MessageSquare, Camera, Copy, Check, ShieldCheck, Key, RefreshCw } from "lucide-react";

interface IntegrationsSettingsFormProps {
  initialSettings: Record<string, string>;
  originUrl?: string;
}

export function IntegrationsSettingsForm({ initialSettings, originUrl }: IntegrationsSettingsFormProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseUrl = originUrl || (typeof window !== "undefined" ? window.location.origin : "https://your-domain.com");

  const whatsappWebhookUrl = `${baseUrl}/api/webhooks/whatsapp`;
  const instagramWebhookUrl = `${baseUrl}/api/webhooks/instagram`;

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateBusinessSettingsAction(settings);
      if (res.success) {
        toast.success("Social Integration settings updated successfully!");
      } else {
        toast.error(res.error || "Failed to update integration settings");
      }
    } catch {
      toast.error("Error saving integration settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* WhatsApp Integration Box */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                WhatsApp Business Cloud API
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                    settings.whatsapp_enabled === "true"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {settings.whatsapp_enabled === "true" ? "Active" : "Disabled"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Receive incoming WhatsApp messages directly into the Studio Inbox via Meta Cloud API.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.whatsapp_enabled === "true"}
              onChange={(e) => handleChange("whatsapp_enabled", e.target.checked ? "true" : "false")}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Webhook Callback URL Banner */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>WhatsApp Webhook Callback URL:</span>
            <button
              type="button"
              onClick={() => handleCopy(whatsappWebhookUrl, "wa_url")}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
            >
              {copiedKey === "wa_url" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "wa_url" ? "Copied" : "Copy URL"}</span>
            </button>
          </div>
          <code className="block text-xs font-mono bg-background p-2 rounded border border-border text-foreground break-all">
            {whatsappWebhookUrl}
          </code>
        </div>

        {/* Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">
              WhatsApp Phone Number ID
            </label>
            <input
              type="text"
              placeholder="e.g. 102938475610293"
              value={settings.whatsapp_phone_number_id || ""}
              onChange={(e) => handleChange("whatsapp_phone_number_id", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-muted-foreground mb-1">
              Webhook Verify Token
            </label>
            <input
              type="text"
              placeholder="e.g. aazhi_studio_verify_token"
              value={settings.whatsapp_verify_token || "aazhi_studio_verify_token"}
              onChange={(e) => handleChange("whatsapp_verify_token", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-muted-foreground mb-1">
              WhatsApp System User Permanent Access Token
            </label>
            <input
              type="password"
              placeholder="EAAG..."
              value={settings.whatsapp_access_token || ""}
              onChange={(e) => handleChange("whatsapp_access_token", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Instagram Direct Integration Box */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                Instagram Direct Graph API
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                    settings.instagram_enabled === "true"
                      ? "bg-pink-500/10 text-pink-600 border border-pink-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {settings.instagram_enabled === "true" ? "Active" : "Disabled"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Receive customer DMs and story replies directly into the Studio Inbox via Meta Graph API.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.instagram_enabled === "true"}
              onChange={(e) => handleChange("instagram_enabled", e.target.checked ? "true" : "false")}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        {/* Webhook Callback URL Banner */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Instagram Webhook Callback URL:</span>
            <button
              type="button"
              onClick={() => handleCopy(instagramWebhookUrl, "ig_url")}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
            >
              {copiedKey === "ig_url" ? <Check className="w-3.5 h-3.5 text-pink-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "ig_url" ? "Copied" : "Copy URL"}</span>
            </button>
          </div>
          <code className="block text-xs font-mono bg-background p-2 rounded border border-border text-foreground break-all">
            {instagramWebhookUrl}
          </code>
        </div>

        {/* Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">
              Instagram Page / Business Account ID
            </label>
            <input
              type="text"
              placeholder="e.g. 17841400000000000"
              value={settings.instagram_account_id || ""}
              onChange={(e) => handleChange("instagram_account_id", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-muted-foreground mb-1">
              Webhook Verify Token
            </label>
            <input
              type="text"
              placeholder="e.g. aazhi_studio_verify_token"
              value={settings.instagram_verify_token || "aazhi_studio_verify_token"}
              onChange={(e) => handleChange("instagram_verify_token", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-muted-foreground mb-1">
              Instagram Page Access Token
            </label>
            <input
              type="password"
              placeholder="EAAG..."
              value={settings.instagram_access_token || ""}
              onChange={(e) => handleChange("instagram_access_token", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isSubmitting ? "Saving Integrations..." : "Save Integration Settings"}</span>
        </button>
      </div>
    </form>
  );
}
