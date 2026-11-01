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
  isDownload,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  // Iframe pages are for in-app playback only and are not downloadable files.
  if (isDownload || !isSupportedEmbed(link)) return [];
  return [{
    server: "FrameXTV Embed",
    link,
    type: "iframe",
  }];
};
