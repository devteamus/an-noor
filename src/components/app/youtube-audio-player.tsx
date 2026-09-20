"use client";

import * as React from "react";
import { Play, Pause, Volume2, Loader2, Youtube, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeAudioPlayerProps {
  url: string;
  title?: string;
  compact?: boolean;
  accentColor?: string;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isDirectAudio(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
}

export function YouTubeAudioPlayer({
  url,
  title,
  compact = true,
  accentColor = "from-emerald-500 to-teal-600",
}: YouTubeAudioPlayerProps) {
  const videoId = extractVideoId(url);
  const isAudio = isDirectAudio(url);
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [mounted, setMounted] = React.useState(!compact || isAudio);

  // cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ---------- DIRECT AUDIO (mp3/wav/etc.) ----------
  if (isAudio) {
    const handleAudioPlay = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.addEventListener("play", () => setPlaying(true));
        audioRef.current.addEventListener("pause", () => setPlaying(false));
        audioRef.current.addEventListener("ended", () => setPlaying(false));
      }
      if (playing) {
        audioRef.current.pause();
      } else {
        setLoading(true);
        audioRef.current.play()
          .then(() => { setPlaying(true); setLoading(false); })
          .catch(() => { setPlaying(false); setLoading(false); });
      }
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAudioPlay}
          aria-label={playing ? "বিরতি" : "অডিও চালান"}
          className={cn(
            "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-br text-white shadow-md transition-transform hover:scale-105 active:scale-95",
            accentColor
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate font-bengali text-xs text-muted-foreground">
            {playing ? "চলছে..." : "অডিও শুনুন"}
          </span>
          <Music className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
        </div>
      </div>
    );
  }

  // ---------- YOUTUBE ----------
  if (!videoId) return null;

  const handlePlayPause = () => {
    if (!mounted) {
      setMounted(true);
      setLoading(true);
      setPlaying(true);
      return;
    }
    if (iframeRef.current) {
      const cmd = playing ? "pauseVideo" : "playVideo";
      const args = JSON.stringify({ event: "command", func: cmd, args: [] });
      iframeRef.current.contentWindow?.postMessage(args, "*");
      setPlaying(!playing);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    if (playing && iframeRef.current) {
      const args = JSON.stringify({ event: "command", func: "playVideo", args: [] });
      iframeRef.current.contentWindow?.postMessage(args, "*");
    }
  };

  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?enablejsapi=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3` +
    (compact ? `&controls=0&disablekb=1` : `&controls=1`);

  if (!compact) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60 bg-black">
        <div className="relative aspect-video w-full">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title || "YouTube video"}
            className="absolute inset-0 h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePlayPause}
        aria-label={playing ? "বিরতি" : "অডিও চালান"}
        className={cn(
          "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-br text-white shadow-md transition-transform hover:scale-105 active:scale-95",
          accentColor
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 translate-x-0.5" />
        )}
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Volume2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="truncate font-bengali text-xs text-muted-foreground">
          {playing ? "চলছে..." : "অডিও শুনুন"}
        </span>
        <Youtube className="ml-auto h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden />
      </div>
      {mounted && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "YouTube audio"}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          onLoad={handleIframeLoad}
        />
      )}
    </div>
  );
}
