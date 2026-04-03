# 🎬 Netflix Clone - Full Stack MERN Application

A production-ready Netflix clone built with MongoDB, Express, React, and Node.js. Features user authentication, movie browsing, watchlist management, reviews, and a premium Netflix-inspired UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- TMDB API key (themoviedb.org)
- Gmail account (for password reset)

### Installation & Running

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

**Frontend:** http://localhost:5174  
**Backend:** http://localhost:5000

---

## ⚙️ Environment Setup

### server/.env
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/netflix
JWT_SECRET=your-super-secret-key-min-32-chars
TMDB_API_KEY=your-tmdb-api-key
CLIENT_URL=http://localhost:5174
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### client/.env
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ✨ Features

### 🔐 Authentication
- User registration & login with JWT
- Password reset via email
- Protected routes
- Profile management
- Account deletion

### 🎥 Movie Discovery
- Trending, Popular, Top-Rated movies
- Multi-language support (12 languages)
- Genre-based browsing
- Real-time search
- Movie recommendations
- YouTube trailer playback

### 📋 User Features
- Personal watchlist
- Watch history with resume
- Star ratings (1-5)
- Movie reviews
- Toast notifications

### 🎨 UI/UX
- Netflix-inspired dark theme
- Fully responsive (mobile/tablet/desktop)
- Smooth animations
- Optimized loading states

---

## 📁 Project Structure

```
Netflix-Clone/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Navbar, MovieCard, Modal, etc.
│   │   ├── pages/            # Home, Browse, Watchlist, Profile
│   │   ├── api/              # API integration
│   │   ├── context/          # Auth, Theme, Toast contexts
│   │   └── hooks/            # Custom hooks
│   └── package.json
│
├── server/                    # Express Backend
│   ├── routes/               # API endpoints
│   ├── models/               # MongoDB schemas
│   ├── index.js              # Server entry
│   └── package.json
│
└── package.json              # Root package.json
```

---

## 🛠️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password/:token | Reset password |
| DELETE | /api/auth/delete-account | Delete account |

### Watchlist & History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/watchlist | Get user watchlist |
| POST | /api/auth/watchlist | Add to watchlist |
| DELETE | /api/auth/watchlist/:movieId | Remove from watchlist |
| GET | /api/auth/watch-history | Get watch history |
| POST | /api/auth/watch-history | Save watch progress |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trending | Get trending movies |
| GET | /api/popular | Get popular movies |
| GET | /api/search?query=NAME | Search movies |
| GET | /api/movie/:id | Get movie details |
| GET | /api/genres | Get all genres |
| GET | /api/movies-by-language?language=CODE | Get movies by language |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reviews/:movieId | Get movie reviews |
| POST | /api/reviews | Submit review |

---

## 🌍 Supported Languages

| Code | Language |
|------|----------|
| hi | Hindi |
| ta | Tamil |
| te | Telugu |
| kn | Kannada |
| ml | Malayalam |
| mr | Marathi |
| en | English |
| es | Spanish |
| fr | French |
| de | German |
| zh | Chinese |
| ja | Japanese |
| ko | Korean |

---

## 📋 Testing Checklist

- [ ] Sign up with new account
- [ ] Login with credentials
- [ ] Browse trending movies
- [ ] Search for a movie
- [ ] View movie details
- [ ] Play movie trailer
- [ ] Add movie to watchlist
- [ ] Remove from watchlist
- [ ] Submit review with rating
- [ ] View watch history
- [ ] Access user profile
- [ ] Reset password via email
- [ ] Logout

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Whitelist your IP in MongoDB Atlas
- Use correct connection string

### TMDB Not Working
- Verify API key is valid
- Check TMDB account is active
- Check rate limits

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Email Not Sending
- Enable 2-factor auth on Gmail
- Use Gmail App Password (16 chars)

---

## 🏗️ Tech Stack

### Frontend
- React 19
- React Router 7
- Axios
- Tailwind CSS
- Vite

### Backend
- Express.js
- Node.js
- MongoDB
- Mongoose
- JWT
- Bcryptjs
- Nodemailer

---

## 📁 Git Setup

This project includes `.gitignore` files at root, client, and server levels to prevent sensitive files from being pushed:

- Root `.gitignore` - Ignores node_modules, env files, logs
- Client `.gitignore` - Ignores dist, node_modules, local files
- Server `.gitignore` - Ignores env files, node_modules, logs

**Important:** Never commit `.env` files. Each developer should create their own using the template in this README.

---

## ✅ What's Working

- Complete authentication system
- Password reset via email
- Personal watchlist
- Movie search
- 12 language movie support
- Genre filtering
- Movie details & reviews
- User profile
- Responsive design
- Toast notifications
- Watch history

---

## 📝 License

This project is for educational purposes.

---

**Built with ❤️** 🎬✨
