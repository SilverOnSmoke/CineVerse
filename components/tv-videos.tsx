import { fetchTMDBApi } from '@/lib/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface TVVideosProps {
  tvId: string;
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

export async function TVVideos({ tvId }: TVVideosProps) {
  const videos = await fetchTMDBApi<VideosResponse>(`/tv/${tvId}/videos`);

  const trailers = videos.results
    .filter(video => 
      video.site === 'YouTube' && 
      video.type === 'Trailer'
    )
    .slice(0, 4); // Limit to 4 videos

  if (trailers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No trailers available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trailers.map((video) => (
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