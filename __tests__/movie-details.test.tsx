import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Add this import to fix toBeInTheDocument errors
import MovieDetailsPage from '@/app/movie/[id]/details/page'
import { fetchTMDBApi } from '@/lib/tmdb'

// Mock the fetch function
jest.mock('@/lib/tmdb', () => ({
  fetchTMDBApi: jest.fn(),
  getTMDBImageUrl: jest.fn().mockReturnValue('https://image.url')
}))

describe('MovieDetailsPage', () => {
  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    poster_path: '/test.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2023-01-01',
    vote_average: 7.5,
    runtime: 120,
    genres: [{ id: 1, name: 'Action' }],
    tagline: 'Test Tagline',
    status: 'Released',
    budget: 1000000,
    revenue: 2000000,
    original_language: 'en',
    production_companies: [{ id: 1, name: 'Test Studio' }]
  }

  const mockVideos = {
    results: [{
      key: 'test123',
      site: 'YouTube',
      type: 'Trailer'
    }]
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    ;(fetchTMDBApi as jest.Mock).mockImplementation((path) => {
      if (path.includes('/videos')) return Promise.resolve(mockVideos)
      return Promise.resolve(mockMovie)
    })
  })

  it('renders movie details correctly', async () => {
    render(await MovieDetailsPage({ params: { id: '1' } }))

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Test Overview')).toBeInTheDocument()
    expect(screen.getByText('Watch Now')).toBeInTheDocument()
    expect(screen.getByText('Watch Trailer')).toBeInTheDocument()
  })

  it('shows trailer button only when trailer is available', async () => {
    // Mock no trailers available
    ;(fetchTMDBApi as jest.Mock).mockImplementation((path) => {
      if (path.includes('/videos')) return Promise.resolve({ results: [] })
      return Promise.resolve(mockMovie)
    })

    render(await MovieDetailsPage({ params: { id: '1' } }))

    expect(screen.getByText('Watch Now')).toBeInTheDocument()
    expect(screen.queryByText('Watch Trailer')).not.toBeInTheDocument()
  })
})