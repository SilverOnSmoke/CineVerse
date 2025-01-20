// import { Suspense } from 'react';
// import { MovieGrid } from '@/components/movie-grid';
// import { fetchTMDBApi } from '@/lib/tmdb';
// import type { TVShow } from '@/types/tmdb';
// import { PaginationControl } from '@/components/pagination';

// interface TVShowsPageProps {
//   searchParams: { page?: string };
// }

// interface TVShowResponse {
//   page: number;
//   results: TVShow[];
//   total_pages: number;
//   total_results: number;
// }

// export const revalidate = 0;

// export default function TVShowsPage({ searchParams }: TVShowsPageProps) {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">TV Shows</h1>
//       <Suspense fallback={<div>Loading...</div>}>
//         <TVShowList searchParams={searchParams} />
//       </Suspense>
//     </div>
//   );
// }

// async function TVShowList({ searchParams }: { searchParams: { page?: string } }) {
//   const currentPage = Number(searchParams.page) || 1;
  
//   const shows = await fetchTMDBApi<TVShowResponse>('/discover/tv', {
//     page: currentPage.toString(),
//     sort_by: 'popularity.desc',
//   });

//   const showsWithType = shows.results.map(show => ({
//     ...show,
//     media_type: 'tv' as const
//   }));

//   return (
//     <div>
//       <MovieGrid items={showsWithType} />
//       <div className="mt-6">
//         <Suspense fallback={<div>Loading pagination...</div>}>
//           <PaginationControl
//             currentPage={currentPage}
//             totalPages={Math.min(shows.total_pages, 500)}
//             baseUrl="/tv"
//           />
//         </Suspense>
//       </div>
//     </div>
//   );
// } 

import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { TVShow } from '@/types/tmdb';
import { PaginationControl } from '@/components/pagination';

interface TVShowsPageProps {
  searchParams: { page?: string };
}

interface TVShowResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export const revalidate = 0;

export default function TVShowsPage({ searchParams }: TVShowsPageProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4 mt-4 md:mt-6 lg:mt-8 pl-4 sm:pl-6 md:pl-8 lg:pl-10">TV Shows</h1>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <TVShowList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TVShowList({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  
  const shows = await fetchTMDBApi<TVShowResponse>('/discover/tv', {
    page: currentPage.toString(),
    sort_by: 'popularity.desc',
  });

  const showsWithType = shows.results.map(show => ({
    ...show,
    media_type: 'tv' as const
  }));

  return (
    <div>
      <MovieGrid items={showsWithType} />
      <div className="mt-6 pb-20">
        <Suspense fallback={<div>Loading pagination...</div>}>
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.min(shows.total_pages, 500)}
            baseUrl="/tv"
          />
        </Suspense>
      </div>
    </div>
  );
} 