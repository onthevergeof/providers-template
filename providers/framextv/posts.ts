import type { Post, ProviderContext } from "../types";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const NO_POSTER = "https://placehold.co/500x750?text=No+Poster";

type MediaKind = "movie" | "tv";
interface TmdbMedia {
  id: number;
  adult?: boolean;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}
interface TmdbListResponse { results?: TmdbMedia[]; }

function imageUrl(path?: string | null, size = "w500"): string {
  return path ? TMDB_IMAGE + "/" + size + path : NO_POSTER;
}

async function tmdbRequest<T>(
  providerContext: ProviderContext,
  path: string,
  params: Record<string, string | number | boolean> = {},
  signal?: AbortSignal,
): Promise<T> {
  const token = (await providerContext.kvStore.get<string>("tmdbAccessToken"))?.trim();
  if (!token) throw new Error("Add your TMDB Read Access Token in FrameXTV provider settings first.");
  const response = await providerContext.axios.get<T>(TMDB_API + "/" + path.replace(/^\/+/, ""), {
    params,
    headers: { ...providerContext.commonHeaders, Accept: "application/json", Authorization: "Bearer " + token },
    signal,
  });
  return response.data;
}

function titlePost(item: TmdbMedia, forcedKind?: MediaKind): Post {
  const kind = forcedKind || (item.media_type === "tv" ? "tv" : "movie");
  const title = (kind === "movie" ? item.title : item.name) || item.title || item.name || "Untitled";
  const date = kind === "movie" ? item.release_date : item.first_air_date;
  const year = date && /^\d{4}/.test(date) ? date.slice(0, 4) : "";
  return {
    title: year ? title + " (" + year + ")" : title,
    link: "tmdb://" + kind + "/" + item.id,
    image: imageUrl(item.poster_path || item.backdrop_path, item.poster_path ? "w500" : "w780"),
    aspectRatio: item.poster_path ? 0.67 : 1.78,
    provider: "framextv",
  };
}

const ALLOWED_CATALOG_PATHS = new Set([
  "trending/movie/week",
  "movie/popular",
  "movie/top_rated",
  "movie/now_playing",
  "trending/tv/week",
  "tv/popular",
  "tv/top_rated",
  "tv/on_the_air",
]);

export const getPosts = async function ({
  filter, page, providerValue, signal, providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const path = filter.replace(/^\/+/, "");
  if (!ALLOWED_CATALOG_PATHS.has(path)) return [];
  const data = await tmdbRequest<TmdbListResponse>(providerContext, path, {
    page: Math.max(1, Math.min(500, Math.floor(page || 1))),
    include_adult: false,
  }, signal);
  const forcedKind: MediaKind | undefined = path.startsWith("movie/") ? "movie" : path.startsWith("tv/") ? "tv" : undefined;
  return (data.results || [])
    .filter((item) => item.adult !== true && Number.isFinite(item.id) && item.id > 0)
    .map((item) => titlePost(item, forcedKind));
};

export const getSearchPosts = async function ({
  searchQuery, page, providerValue, signal, providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const query = searchQuery.trim();
  if (!query) return [];
  const data = await tmdbRequest<TmdbListResponse>(providerContext, "search/multi", {
    query,
    page: Math.max(1, Math.min(500, Math.floor(page || 1))),
    include_adult: false,
  }, signal);
  return (data.results || [])
    .filter((item) => item.adult !== true && Number.isFinite(item.id) && item.id > 0 && (item.media_type === "movie" || item.media_type === "tv"))
    .map((item) => titlePost(item));
};
