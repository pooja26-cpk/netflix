import React from 'react';

function VideoPlayer({ videoUrl, onEnded }) {
  if (!videoUrl) {
    return <div className="text-white text-center p-4">No video URL provided.</div>;
  }

  // Extract YouTube ID if URL contains v= or is a short youtu.be link
  const extractYouTubeId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1);
      if (urlObj.searchParams.get('v')) return urlObj.searchParams.get('v');
      // fallback: last path segment
      const parts = urlObj.pathname.split('/');
      return parts[parts.length - 1];
    } catch {
      return null;
    }
  };

  const youtubeId = extractYouTubeId(videoUrl);
  const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : videoUrl;

  return (
    <div className="relative pt-[56.25%] bg-black">
      {/* Close button */}
      {onEnded && (
        <button
          onClick={onEnded}
          className="absolute top-4 right-4 z-20 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/90 transition"
          title="Close"
        >
          ✕
        </button>
      )}
      <iframe
        title="Trailer"
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="absolute bottom-4 right-4 text-white z-10">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Open in YouTube
        </a>
      </div>
    </div>
  );
}

export default VideoPlayer;
