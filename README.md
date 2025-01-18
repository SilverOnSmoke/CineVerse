# CineVerse 🎬

A modern streaming platform built with Next.js that provides a seamless experience for browsing and watching movies and TV shows.

## Features ✨

- 🎥 Browse movies and TV shows
- 🔍 Search functionality
- 📺 Stream content directly in the browser
- 📱 Responsive design
- 🌓 Dark/Light mode support
- 🎭 View movie/TV show details, credits, and reviews
- 📺 Episode grid for TV shows
- 🎬 Video player with native controls

## Tech Stack 🛠️

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Static type checking
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [TMDB API](https://www.themoviedb.org/documentation/api) - Movie and TV show data
- [Jest](https://jestjs.io/) - Testing framework

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- Node.js 18.x or later
- npm or yarn
- A TMDB API key (get it from [TMDB website](https://www.themoviedb.org/settings/api))

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cineverse.git
cd cineverse
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_API_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_URL=https://image.tmdb.org/t/p
PORT=3000  # Optional, defaults to 3000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build cache
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Testing 🧪

The project uses Jest and React Testing Library for testing. Test files are located in the `__tests__` directory.

To run tests:
```bash
npm test
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
