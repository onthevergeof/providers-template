import type { ProviderContext, SettingsField } from "../types";

export const getSettingsSchema = async function ({
  providerContext,
}: {
  providerContext: ProviderContext;
}): Promise<SettingsField[]> {
  return [
    {
      key: "tmdbAccessToken",
      type: "text",
      label: "TMDB API Read Access Token",
      description: "Required for catalogue, search and title details. Stored in this provider's Vega settings; do not share it.",
      placeholder: "Paste your TMDB Read Access Token",
      defaultValue: "",
    },
  ];
};
