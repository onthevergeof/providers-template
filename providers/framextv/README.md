# FrameXTV provider for Vega

This provider uses the TMDB API for trending/popular catalogue rows, search, posters and title metadata. Add a TMDB API Read Access Token in Vega under the FrameXTV provider settings. The token is read from Vega's provider key-value store and is not committed to this repository.

On a title's detail page, Vega's Open web action opens the official FrameXTV iframe URL in the in-app WebView. The provider does not scrape, decrypt, or extract media URLs. FrameXTV's published documentation describes an iframe embed; it does not document a direct media-stream endpoint. Accordingly, getStream intentionally returns an empty list rather than pretending the iframe is a native HLS/MP4 stream.

TMDB attribution: This product uses the TMDB API but is not endorsed or certified by TMDB. TMDB data and images are subject to TMDB's terms and attribution requirements. This provider is not affiliated with TMDB or FrameXTV.

FrameXTV's embed URLs are documented at https://framextv.cc/api. TMDB API documentation: https://developer.themoviedb.org/docs/getting-started.
