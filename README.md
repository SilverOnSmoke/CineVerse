<div align="center">

  <h1>🎬 Cineverse</h1>

  <p>A modern movie and TV show streaming platform built with Next.js 13</p>

  

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>



## 🌟 Features



- 🎥 Browse movies and TV shows with a modern, responsive interface

- 🔍 Advanced search functionality with real-time results

- 🌙 Dark/Light mode support

- 📱 Fully responsive design for all devices

- 🚀 Server-side rendering and static generation for optimal performance

- 🎨 Beautiful UI components using shadcn/ui

- 📊 Dynamic charts and data visualization

- 🔄 Real-time updates and smooth transitions

- 🎯 Accessibility focused design



## 🛠️ Tech Stack



- **Framework:** [Next.js 13](https://nextjs.org/)

- **Language:** [TypeScript](https://www.typescriptlang.org/)

- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

- **State Management:** React Context + Hooks

- **Data Fetching:** Server Components + TMDB API

- **Charts:** [Recharts](https://recharts.org/)

- **Animations:** [Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)

- **Icons:** [Lucide React](https://lucide.dev/)



## 🚀 Getting Started



### Prerequisites



- Node.js 18+ and npm



### Installation



1. Clone the repository:

```bash

git clone https://github.com/SilverOnSmoke/CineVerse.git

cd CineVerse

```



2. Install dependencies:

```bash

npm install

```



3. Create a `.env.local` file in the root directory:

```bash

NEXT_PUBLIC_TMDB_API_URL=https://api.themoviedb.org/3

NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here

NEXT_PUBLIC_TMDB_IMAGE_URL=https://image.tmdb.org/t/p

NEXT_PUBLIC_NATIVE_PROVIDER_URL=your_native_provider_url_here

NEXT_PUBLIC_NATIVE_PROVIDER_TOKEN=your_native_provider_token_here

```



4. Start the development server:

```bash

npm run dev

```



Visit `http://localhost:3000` to see the application.



## 📁 Project Structure



```

cineverse/

├── app/                    # Next.js 13 app directory

│   ├── layout.tsx         # Root layout

│   ├── page.tsx           # Home page

│   ├── movie/            # Movie routes

│   └── tv/               # TV show routes

├── components/            # React components

│   ├── ui/               # Reusable UI components

│   ├── movie-grid.tsx    # Movie grid component

│   ├── movie-carousel.tsx # Movie carousel component

│   └── navbar.tsx        # Navigation component

├── lib/                   # Utility functions

│   ├── utils.ts          # Helper functions

│   └── tmdb.ts           # TMDB API integration

├── types/                # TypeScript types

│   └── tmdb.ts          # TMDB API types

└── public/               # Static assets

```



## 🎨 Key Components



### UI Components

- **MovieGrid**: Responsive grid layout for displaying movie/TV show cards

- **MovieCarousel**: Featured content slider with autoplay

- **Navbar**: Responsive navigation with search functionality

- **VideoPlayer**: Custom video player with controls

- **ThemeProvider**: Dark/light mode implementation



### Pages

- **Home**: Featured content and popular movies/shows

- **Movie Details**: Comprehensive movie information

- **TV Show Details**: Episode guides and show information

- **Search Results**: Dynamic search functionality



## 🔧 Development



### Available Scripts



```bash

# Development

npm run dev          # Start development server



# Production

npm run build       # Create production build

npm start          # Start production server



# Utility

npm run lint       # Run ESLint

npm run clean      # Clean build cache

```



### Environment Variables



Required environment variables:



| Variable | Description |

|----------|-------------|

| `NEXT_PUBLIC_TMDB_API_URL` | TMDB API base URL |

| `NEXT_PUBLIC_TMDB_API_KEY` | Your TMDB API key |

| `NEXT_PUBLIC_TMDB_IMAGE_URL` | TMDB image CDN URL |

| `NEXT_PUBLIC_NATIVE_PROVIDER_URL` | Native streaming provider URL |

| `NEXT_PUBLIC_NATIVE_PROVIDER_TOKEN` | Authentication token for native provider |



## 🎯 Core Features



### Movie/TV Show Browsing

- Responsive grid layout

- Infinite scroll implementation

- Quick view functionality

- Advanced filtering options



### Search Functionality

- Real-time search results

- Search history

- Advanced filters

- Keyboard navigation



### User Experience

- Responsive design for all devices

- Smooth animations and transitions

- Lazy loading for optimal performance

- Accessibility compliance



## 📈 Performance Optimizations



- **Image Optimization**

  - Next.js Image component for automatic optimization

  - Lazy loading implementation

  - WebP format support



- **Code Splitting**

  - Dynamic imports for routes

  - Component-level code splitting

  - Optimal chunk management



- **Caching Strategy**

  - Static page generation where possible

  - Incremental Static Regeneration

  - API response caching



## 🔒 Security



- Environment variable protection

- API key security

- XSS prevention

- CORS configuration

- Content Security Policy



## 📱 Responsive Design



- Mobile-first approach

- Breakpoint system:

  - Mobile: < 640px

  - Tablet: 640px - 1024px

  - Desktop: > 1024px



## 🤝 Contributing



We welcome contributions! Please follow these steps:



1. Fork the repository

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request



## 📄 License



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## 🙏 Acknowledgments



- [TMDB](https://www.themoviedb.org/) for providing the movie database API

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components

- [Vercel](https://vercel.com) for hosting

- All our contributors and supporters



---



<div align="center">

  <p>Made with ❤️ by the Cineverse Team</p>

  <p>

    <a href="https://github.com/SilverOnSmoke/CineVerse/issues">Report Bug</a>

    ·

    <a href="https://github.com/SilverOnSmoke/CineVerse/issues">Request Feature</a>

  </p>

</div>
