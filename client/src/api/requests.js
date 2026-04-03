const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const requests = {
  // Trending & Popular
  trending: `${BASE_URL}/trending`,
  popular: `${BASE_URL}/popular`,
  topRated: `${BASE_URL}/top-rated`,
  
  // Netflix Originals (discover movies with Netflix as production company)
  fetchNetflixOriginals: `${BASE_URL}/discover/movie?with_networks=213`,
  
  // Genre-based movies
  fetchActionMovies: `${BASE_URL}/genre/28`,
  fetchComedyMovies: `${BASE_URL}/genre/35`,
  fetchHorrorMovies: `${BASE_URL}/genre/27`,
  fetchRomanceMovies: `${BASE_URL}/genre/10749`,
  fetchDocumentaries: `${BASE_URL}/genre/99`,
  
  // Search & Filters
  search: `${BASE_URL}/search`,
  genres: `${BASE_URL}/genres`,
  moviesByGenre: (genreId) => `${BASE_URL}/genre/${genreId}`,
  
  // Regional Movies - Tamil
  tamilMovies: `${BASE_URL}/movies-by-language?language=ta`,
  tamilTrending: `${BASE_URL}/trending-by-language?language=ta`,
  tamilPopular: `${BASE_URL}/popular-by-language?language=ta`,
  
  // Regional Movies - Telugu
  teluguMovies: `${BASE_URL}/movies-by-language?language=te`,
  teluguTrending: `${BASE_URL}/trending-by-language?language=te`,
  teluguPopular: `${BASE_URL}/popular-by-language?language=te`,
  
  // Regional Movies - Kannada
  kannadaMovies: `${BASE_URL}/movies-by-language?language=kn`,
  kannadaTrending: `${BASE_URL}/trending-by-language?language=kn`,
  kannadaPopular: `${BASE_URL}/popular-by-language?language=kn`,
  
  // Regional Movies - Malayalam
  malayalamMovies: `${BASE_URL}/movies-by-language?language=ml`,
  malayalamTrending: `${BASE_URL}/trending-by-language?language=ml`,
  malayalamPopular: `${BASE_URL}/popular-by-language?language=ml`,
  
  // Regional Movies - Marathi
  marathiMovies: `${BASE_URL}/movies-by-language?language=mr`,
  marathiTrending: `${BASE_URL}/trending-by-language?language=mr`,
  marathiPopular: `${BASE_URL}/popular-by-language?language=mr`,
  
  // International - Spanish
  spanishMovies: `${BASE_URL}/movies-by-language?language=es`,
  spanishTrending: `${BASE_URL}/trending-by-language?language=es`,
  spanishPopular: `${BASE_URL}/popular-by-language?language=es`,
  
  // International - French
  frenchMovies: `${BASE_URL}/movies-by-language?language=fr`,
  frenchTrending: `${BASE_URL}/trending-by-language?language=fr`,
  frenchPopular: `${BASE_URL}/popular-by-language?language=fr`,
  
  // International - German
  germanMovies: `${BASE_URL}/movies-by-language?language=de`,
  germanTrending: `${BASE_URL}/trending-by-language?language=de`,
  germanPopular: `${BASE_URL}/popular-by-language?language=de`,
  
  // International - Chinese
  chineseMovies: `${BASE_URL}/movies-by-language?language=zh`,
  chineseTrending: `${BASE_URL}/trending-by-language?language=zh`,
  chinesePopular: `${BASE_URL}/popular-by-language?language=zh`,
  
  // International - Japanese
  japaneseMovies: `${BASE_URL}/movies-by-language?language=ja`,
  japaneseTrending: `${BASE_URL}/trending-by-language?language=ja`,
  japanesePopular: `${BASE_URL}/popular-by-language?language=ja`,
  
  // International - Korean
  koreanMovies: `${BASE_URL}/movies-by-language?language=ko`,
  koreanTrending: `${BASE_URL}/trending-by-language?language=ko`,
  koreanPopular: `${BASE_URL}/popular-by-language?language=ko`,
  
  // International - Hindi
  hindiMovies: `${BASE_URL}/movies-by-language?language=hi`,
  hindiTrending: `${BASE_URL}/trending-by-language?language=hi`,
  hindiPopular: `${BASE_URL}/popular-by-language?language=hi`,
  
  // Movie Details
  movieDetails: (id) => `${BASE_URL}/movie/${id}`,
  movieVideos: (id) => `${BASE_URL}/movie/${id}/videos`,
  movieCredits: (id) => `${BASE_URL}/movie/${id}/credits`,
  movieReviews: (id) => `${BASE_URL}/movie/${id}/reviews`,
  movieRecommendations: (id) => `${BASE_URL}/movie/${id}/recommendations`,

  // TV Show Endpoints
  tvTrending: `${BASE_URL}/tv/trending`,
  tvPopular: `${BASE_URL}/tv/popular`,
  tvTopRated: `${BASE_URL}/tv/top-rated`,
  tvShowsByGenre: (genreId) => `${BASE_URL}/tv/genre/${genreId}`,
  tvShowDetails: (id) => `${BASE_URL}/tv/${id}`,
  tvShowCredits: (id) => `${BASE_URL}/tv/${id}/credits`,
  tvShowVideos: (id) => `${BASE_URL}/tv/${id}/videos`,
  tvCredits: (id) => `/api/tv/${id}/credits`,
  tvVideos: (id) => `/api/tv/${id}/videos`,
  // Add other TV endpoints as needed
  
  // User-specific
  recommendations: `${BASE_URL}/recommendations`,
  tamilRecommendations: `${BASE_URL}/tamil-recommendations`,
  
  // Actor search & filter
  searchPerson: (query) => `${BASE_URL}/search-person?query=${encodeURIComponent(query)}`,
  filterMovies: (actorId, actorName, language) => {
    const params = new URLSearchParams();
    if (actorId) params.append('actor_id', actorId);
    if (actorName) params.append('actor_name', actorName);
    if (language) params.append('language', language);
    return `${BASE_URL}/filter?${params.toString()}`;
  },
};

export default requests;
