import Image from 'next/image';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { fetchTMDBApi } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCreditsProps {
  movieId: string;
}

interface Credits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

export async function MovieCredits({ movieId }: MovieCreditsProps) {
  const credits = await fetchTMDBApi<Credits>(`/movie/${movieId}/credits`);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {credits.cast.slice(0, 12).map((person) => (
        <Card key={person.id} className="border-0 bg-transparent">
          <CardContent className="p-0">
            <div className="aspect-square relative rounded-full overflow-hidden mb-3">
              {person.profile_path ? (
                <Image
                  src={getTMDBImageUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {person.name[0]}
                </div>
              )}
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-sm line-clamp-1">{person.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {person.character}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 