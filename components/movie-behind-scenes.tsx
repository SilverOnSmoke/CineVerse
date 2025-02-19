import { fetchTMDBApi } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MovieBehindScenesProps {
  movieId: string;
}

interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  published_at: string;
}

interface VideosResponse {
  results: VideoResult[];
}

export async function MovieBehindScenes({ movieId }: MovieBehindScenesProps) {
  const videos = await fetchTMDBApi<VideosResponse>(`/movie/${movieId}/videos`);

  const behindScenes = videos.results
    .filter(video => 
      video.site === 'YouTube' && 
      (video.type === 'Behind the Scenes' || video.type === 'Featurette')
    )
    .slice(0, 4); // Limit to 4 videos

  if (behindScenes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No behind the scenes content available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {behindScenes.map((video) => (
        <Card key={video.id}>
          <CardContent className="p-4">
            <AspectRatio ratio={16/9}>
              <iframe
                src={`https://www.youtube.com/embed/${video.key}?loading=lazy`}
                title={video.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
                loading="lazy"
              />
            </AspectRatio>
            <h3 className="mt-3 font-semibold">{video.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(video.published_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}