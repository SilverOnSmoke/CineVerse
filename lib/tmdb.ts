const TMDB_API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p';

export const getTMDBImageUrl = (path: string, size: string = 'original') => {
  if (!path) return '';
  return `${TMDB_IMAGE_URL}/${size}${path}`;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldLog = process.env.NEXT_PUBLIC_ENABLE_API_LOGS === 'true' && process.env.NODE_ENV === 'development';

// List of endpoints that commonly return 404s and can be silently ignored
const silentFailureEndpoints = [
  '/collection/',  // Collection details often 404 for certain IDs
];

// Check if an endpoint should have silent failures
const shouldSilenceErrors = (endpoint: string, status: number): boolean => {
  // Only silence 404 errors
  if (status !== 404) return false;
  
  // Check if the endpoint is in our silent list
  return silentFailureEndpoints.some(silentEndpoint => 
    endpoint.startsWith(silentEndpoint)
  );
};

export async function fetchTMDBApi<T>(
  endpoint: string,
  params: Record<string, string> = {},
  retries = 3
): Promise<T> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is missing');
    throw new Error('TMDB API key is not configured');
  }

  const url = new URL(`${TMDB_API_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      if (shouldLog) {
        console.log(`Attempting to fetch: ${url.toString()}`);
      }

      const response = await fetch(url.toString(), {
        next: { 
          revalidate: 3600
        },
        keepalive: true,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Don't log 404 errors for certain endpoints
        if (!shouldSilenceErrors(endpoint, response.status)) {
          console.error(`API Error: Status ${response.status}`, errorText);
        }
        
        throw new Error(`Failed to fetch data from TMDB: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (shouldLog && error instanceof Error && !error.message.includes('404') && 
          !silentFailureEndpoints.some(path => endpoint.startsWith(path))) {
        console.error(`Attempt ${i + 1} failed:`, error);
      }
      
      lastError = error as Error;
      
      if (i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        if (shouldLog && !(error instanceof Error && error.message.includes('404') && 
            silentFailureEndpoints.some(path => endpoint.startsWith(path)))) {
          console.log(`Waiting ${waitTime}ms before retry...`);
        }
        await wait(waitTime);
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to fetch data from TMDB');
}