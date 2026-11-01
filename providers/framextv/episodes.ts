import type { EpisodeLink, ProviderContext } from "../types";

const TMDB_API = "https://api.themoviedb.org/3";
const FRAME_XTV_EMBED = "https://framextv.xyz/embed";

interface TmdbEpisode {
  id: number;
  name?: string;
  episode_number: number;
  overview?: string;
  still_path?: string | null;
}
interface TmdbSeasonResponse {
  episodes?: TmdbEpisode[];
}

export const getEpisodes = async function ({
  url,
  providerContext,
}: {
  url: string;
  providerContext: ProviderContext;
}): Promise<EpisodeLink[]> {
  const match = /^framextv:\/\/tv\/(\d+)\/(\d+)$/.exec(url.trim());
  if (!match) throw new Error("Invalid FrameXTV season reference.");

  const [, rawId, rawSeason] = match;
  const tmdbId = Number(rawId);
  const season = Number(rawSeason);
  const token = (await providerContext.kvStore.get<string>("tmdbAccessToken"))?.trim();
  if (!token) throw new Error("Add your TMDB Read Access Token in FrameXTV provider settings first.");

  const response = await providerContext.axios.get<TmdbSeasonResponse>(
    TMDB_API + "/tv/" + tmdbId + "/season/" + season,
    {
      headers: {
        ...providerContext.commonHeaders,
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    },
  );

  return (response.data.episodes || [])
    .filter((episode) => Number.isInteger(episode.episode_number) && episode.episode_number > 0)
    .map((episode) => ({
      title: episode.name?.trim() || "Episode " + episode.episode_number,
      description: episode.overview?.trim() || undefined,
      image: episode.still_path
        ? "https://image.tmdb.org/t/p/w780" + episode.still_path
        : undefined,
      link: FRAME_XTV_EMBED + "/" + tmdbId + "/" + season + "/" + episode.episode_number,
    }));
};
