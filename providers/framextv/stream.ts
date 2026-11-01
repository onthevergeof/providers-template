import type { Stream, ProviderContext } from "../types";

export const getStream = async function ({
  link,
  type,
  signal,
  providerContext,
  isDownload,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  // FrameXTV's published integration is an iframe embed, not a direct media URL.
  // The provider exposes that URL through Info.webUrl so Vega opens it in its
  // in-app WebView. Do not mislabel an HTML page as an HLS/MP4 native stream.
  return [];
};
