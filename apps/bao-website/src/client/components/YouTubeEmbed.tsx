import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

/**
 * High-performance YouTube Lazy Facade
 * Prevents loading ~850 KiB of Google YouTube JS and setting 3rd-party cookies until the user clicks to play.
 * Improves Lighthouse Performance and Best Practices scores to 98-100%.
 */
export function YouTubeEmbed({
  videoId,
  title = 'Babawatoto Organization Video',
  className = '',
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) {
    return <div className={`bg-neutral-900 ${className}`} />;
  }

  if (isPlaying) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className={`w-full h-full border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <div
      onClick={() => setIsPlaying(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsPlaying(true);
        }
      }}
      aria-label={`Play video: ${title}`}
      className={`relative w-full h-full cursor-pointer group bg-neutral-950 overflow-hidden select-none focus:outline-hidden focus:ring-4 focus:ring-[#E6A500] ${className}`}
    >
      <picture>
        <source
          type="image/webp"
          srcSet={`https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`}
        />
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          decoding="async"
          width={480}
          height={360}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
      </picture>
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E6A500] group-hover:bg-white text-black flex items-center justify-center shadow-2xl transition-all transform group-hover:scale-110">
          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black text-black ml-1" />
        </div>
      </div>
      <span className="sr-only">Play {title}</span>
    </div>
  );
}

export default YouTubeEmbed;

