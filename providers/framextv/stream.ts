import type { Stream, ProviderContext } from "../types";

const FRAME_XTV_HOST = "framextv.xyz";

function isSupportedEmbed(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.toLowerCase() === FRAME_XTV_HOST &&
      /^\/embed\/\d+(?:\/\d+\/\d+)?\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export const getStream = async function ({
  link,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  // FrameXTV documents iframe embeds, not direct MP4/HLS media URLs.
  // Return the supported embed as an iframe stream so Vega can render it
  // in its embedded WebView player without mislabelling HTML as video.
  if (!isSupportedEmbed(link)) return [];
  return [{
    server: "FrameXTV Embed",
    link,
    type: "iframe",
  }];
};
