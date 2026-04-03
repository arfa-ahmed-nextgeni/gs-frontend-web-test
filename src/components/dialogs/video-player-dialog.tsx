"use client";

import { useState } from "react";

import Image from "next/image";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PlayCircle } from "lucide-react";

import CloseIcon from "@/assets/icons/close-icon.svg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { getVimeoEmbedUrl, getYouTubeEmbedUrl } from "@/lib/utils/video";

export const VideoPlayerDialog = ({
  videoThumbnail,
  videoUrl,
}: {
  videoThumbnail?: null | string;
  videoUrl: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl =
    getYouTubeEmbedUrl(videoUrl, true) ??
    getVimeoEmbedUrl(videoUrl, true) ??
    "";

  return (
    <Dialog onOpenChange={() => setIsLoading(true)}>
      <DialogTrigger className="relative size-full">
        {videoThumbnail && (
          <Image
            alt="Video thumbnail"
            className="object-contain"
            fill
            sizes="(max-width: 1024px) 100vw, 78vw"
            src={videoThumbnail}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="size-16 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
        </div>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="h-[90vh] w-full max-w-4xl overflow-hidden p-0"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Video player</DialogTitle>
        </VisuallyHidden>
        <DialogClose className="bg-bg-default absolute end-2.5 top-2.5 rounded-full p-2.5">
          <Image alt="close" className="size-5" src={CloseIcon} />
        </DialogClose>
        {isLoading && (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Spinner className="size-12.5" size={50} variant="dark" />
          </div>
        )}
        {embedUrl && (
          <iframe
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
            loading="eager"
            onError={() => setIsLoading(false)}
            onLoad={() => setIsLoading(false)}
            src={embedUrl}
            title="Product video"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
