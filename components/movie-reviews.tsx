import { fetchTMDBApi } from '@/lib/tmdb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MovieReviewsProps {
  movieId: string;
}

interface Reviews {
  results: {
    id: string;
    author: string;
    content: string;
    created_at: string;
    author_details: {
      rating: number;
      avatar_path: string | null;
    };
  }[];
}

export async function MovieReviews({ movieId }: MovieReviewsProps) {
  const reviews = await fetchTMDBApi<Reviews>(`/movie/${movieId}/reviews`);

  if (reviews.results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.results.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              {review.author_details.avatar_path ? (
                <AvatarImage
                  src={review.author_details.avatar_path.replace(/^\//, '')}
                  alt={review.author}
                />
              ) : (
                <AvatarFallback>{review.author[0]}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h4 className="font-semibold">{review.author}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            {review.author_details.rating && (
              <div className="ml-auto">
                <Badge variant="secondary">
                  {review.author_details.rating}/10
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="line-clamp-4">{review.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 