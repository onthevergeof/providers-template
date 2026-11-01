# FrameXTV provider for Vega

This provider uses the TMDB API for catalogue rows, search, posters, title details, seasons and episode metadata. Add a TMDB API Read Access Token in Vega under the FrameXTV provider settings. The token is read from Vega's provider key-value store and is not committed to this repository.

Movies and TV episodes are opened with FrameXTV's documented iframe embed URLs:
- Movie: `https://framextv.xyz/embed/{TMDB_ID}`
- Episode: `https://framextv.xyz/embed/{TMDB_ID}/{SEASON}/{EPISODE}`

The provider returns these as `iframe` streams. Install this provider with a Vega build that supports iframe streams in its embedded WebView player. The provider intentionally does not scrape, decrypt, or fabricate direct media URLs.

TMDB attribution: This product uses the TMDB API but is not endorsed or certified by TMDB. TMDB data and images are subject to TMDB's terms and attribution requirements. This provider is not affiliated with TMDB or FrameXTV.

Documentation:
- FrameXTV: https://framextv.cc/api
- TMDB: https://developer.themoviedb.org/docs/getting-started
