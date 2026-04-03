import { useEffect, useState } from "react";

function NetflixIntro({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-999 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes netflix-pulse {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes netflix-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(229, 9, 20, 0.5),
                         0 0 20px rgba(229, 9, 20, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(229, 9, 20, 0.8),
                         0 0 30px rgba(229, 9, 20, 0.5),
                         0 0 40px rgba(229, 9, 20, 0.3);
          }
        }

        .netflix-text {
          animation: netflix-pulse 1.5s ease-in-out, netflix-glow 2s ease-in-out infinite;
          font-weight: 900;
          letter-spacing: 2px;
        }
      `}</style>

      <div className="netflix-text text-6xl md:text-8xl font-bold text-[#E50914]">
        NETFLIX
      </div>
    </div>
  );
}

export default NetflixIntro;
