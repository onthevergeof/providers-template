import type { Info, Link, ProviderContext } from "../types";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const FRAME_XTV_EMBED = "https://framextv.xyz/embed";
const NO_POSTER = "https://placehold.co/500x750?text=No+Poster";

type MediaKind = "movie" | "tv";
interface TmdbSeason {
  id?: number;
  name?: string;
  season_number: number;
  episode_count?: number;
}
interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  imdb_id?: string | null;
  external_ids?: { imdb_id?: string | null };
  vote_average?: number;
  genres?: { name: string }[];
  credits?: { cast?: { name: string }[] };
  seasons?: TmdbSeason[];
}

function imageUrl(path?: string | null, size = "w500"): string {
  return path ? TMDB_IMAGE + "/" + size + path : NO_POSTER;
}

function movieEmbed(id: number): string {
  return FRAME_XTV_EMBED + "/" + id;
}

function episodeEmbed(id: number, season: number, episode: number): string {
  return FRAME_XTV_EMBED + "/" + id + "/" + season + "/" + episode;
}

async function tmdbRequest<T>(providerContext: ProviderContext, path: string): Promise<T> {
  const token = (await providerContext.kvStore.get<string>("tmdbAccessToken"))?.trim();
  if (!token) throw new Error("Add your TMDB Read Access Token in FrameXTV provider settings first.");
  const response = await providerContext.axios.get<T>(TMDB_API + "/" + path.replace(/^\/+/, ""), {
    params: { append_to_response: "credits,external_ids" },
    headers: { ...providerContext.commonHeaders, Accept: "application/json", Authorization: "Bearer " + token },
  });
  return response.data;
}

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const match = /^tmdb:\/\/(movie|tv)\/(\d+)$/i.exec(link.trim());
  if (!match) throw new Error("Invalid FrameXTV title link. Refresh the catalogue and try again.");
  const kind = match[1].toLowerCase() as MediaKind;
  const id = Number(match[2]);
  const details = await tmdbRequest<TmdbDetails>(providerContext, kind + "/" + id);
  const title = (kind === "movie" ? details.title : details.name) || "Untitled";
  const poster = imageUrl(details.poster_path, "w500");
  const backdrop = details.backdrop_path ? imageUrl(details.backdrop_path, "w1280") : poster;
  const synopsis = details.overview?.trim() || "No synopsis is available from TMDB.";
  const attribution = "This product uses the TMDB API but is not endorsed or certified by TMDB.";

  let linkList: Link[];
  let webUrl: string | undefined;
  if (kind === "movie") {
    const embedUrl = movieEmbed(id);
    linkList = [{
      title: "Movie",
      directLinks: [{ title: "Play", link: embedUrl, type: "movie" }],
    }];
    webUrl = embedUrl;
  } else {
    const seasons = (details.seasons || [])
      .filter((season) => Number.isInteger(season.season_number) && season.season_number >= 0)
      .sort((a, b) => a.season_number - b.season_number);
    linkList = seasons.map((season) => ({
      title: season.name?.trim() || "Season " + season.season_number,
      episodesLink: "framextv://tv/" + id + "/" + season.season_number,
    }));
    const firstSeason = seasons[0]?.season_number;
    if (firstSeason !== undefined) webUrl = episodeEmbed(id, firstSeason, 1);
  }

  return {
    title,
    image: backdrop,
    poster,
    synopsis: synopsis + "\n\nData provided by TMDB. " + attribution,
    imdbId: details.imdb_id || details.external_ids?.imdb_id || "",
    tmdbId: String(id),
    type: kind === "movie" ? "movie" : "series",
    tags: (details.genres || []).map((genre) => genre.name).filter(Boolean),
    cast: (details.credits?.cast || []).slice(0, 12).map((person) => person.name).filter(Boolean),
    rating: typeof details.vote_average === "number" ? details.vote_average.toFixed(1) + "/10" : undefined,
    linkList,
    webUrl,
  };
};
