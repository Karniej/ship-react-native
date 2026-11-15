import type { ShipConfig } from "./config";
import type { ShipModuleId } from "./modules";

export interface ShipPreviewAction {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface ShipPreviewData {
  appName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backend: ShipConfig["backend"];
  monetization: ShipConfig["monetization"];
  tabs: string[];
  quickActions: ShipPreviewAction[];
}

const ACTION_META: Partial<Record<ShipModuleId, Omit<ShipPreviewAction, "id">>> = {
  "image-generation": {
    title: "Generate Image",
    subtitle: "Create visuals from prompts",
    color: "#4CAF50",
  },
  "video-generation": {
    title: "Generate Video",
    subtitle: "Create clips and animations",
    color: "#E91E63",
  },
  "text-to-speech": {
    title: "Text to Speech",
    subtitle: "Turn copy into voice",
    color: "#9C27B0",
  },
  transcription: {
    title: "Transcription",
    subtitle: "Turn audio into text",
    color: "#FF5722",
  },
  "image-identification": {
    title: "Image Analysis",
    subtitle: "Understand uploaded images",
    color: "#2196F3",
  },
  "ai-chat": {
    title: "AI Chat",
    subtitle: "Talk to your assistant",
    color: "#00BCD4",
  },
};

export function buildPreviewData(config: ShipConfig): ShipPreviewData {
  const tabs = ["Home"];
  if (config.modules.includes("gallery")) tabs.push("Library");
  tabs.push("Settings");

  const quickActions = config.modules.flatMap((moduleId) => {
    const metadata = ACTION_META[moduleId];
    return metadata ? [{ id: moduleId, ...metadata }] : [];
  });

  return {
    appName: config.branding.name,
    tagline: config.branding.tagline,
    description: config.branding.description,
    primaryColor: config.branding.primaryColor,
    secondaryColor: config.branding.secondaryColor,
    backend: config.backend,
    monetization: config.monetization,
    tabs,
    quickActions,
  };
}
