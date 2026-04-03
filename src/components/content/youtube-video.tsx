"use client";

import Container from "@/components/shared/container";

interface YoutubeVideoProps {
  data: {
    contentType: string;
    internalName?: string;
    videoUrl?: string;
  };
}

export default function YoutubeVideo({ data }: YoutubeVideoProps) {
  if (!data.videoUrl) {
    return null;
  }

  const getVideoId = (url: string): null | string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(data.videoUrl);

  if (!videoId) {
    return null;
  }

  return (
    <Container className="">
      <div className="w-full bg-white p-5 md:p-10">
        <div className="aspect-video w-full overflow-hidden">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={data.internalName || "YouTube video"}
          />
        </div>
      </div>
    </Container>
  );
}
