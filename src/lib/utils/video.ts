export function getVimeoEmbedUrl(url: string, autoplay = false): null | string {
  const id = url.split("/").pop()?.split("?")[0];
  if (!id) return null;

  const params = new URLSearchParams({
    autopause: "0",
    badge: "0",
    byline: "0",
    portrait: "0",
    title: "0",
  });

  if (autoplay) params.append("autoplay", "1");

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

export async function getVimeoThumbnail(
  vimeoUrl: string
): Promise<null | string> {
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`
    );
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error("Error fetching Vimeo thumbnail:", error);
    return null;
  }
}

export function getYouTubeEmbedUrl(
  url: string,
  autoplay = false
): null | string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/
  );
  const id = match?.[1] ?? null;
  if (!id) return null;

  const params = new URLSearchParams({
    modestbranding: "1",
    playsinline: "1", // keep inside dialog on iOS
    rel: "0",
  });

  if (autoplay) params.append("autoplay", "1");

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbnail(youtubeUrl: string): null | string {
  const match = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&].*)?$/);
  const videoId = match ? match[1] : null;
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
