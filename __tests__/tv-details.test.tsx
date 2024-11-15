import { render, screen } from '@testing-library/react'
import TVShowDetailsPage from '@/app/tv/[id]/details/page'
import { fetchTMDBApi } from '@/lib/tmdb'

jest.mock('@/lib/tmdb', () => ({
  fetchTMDBApi: jest.fn(),
  getTMDBImageUrl: jest.fn().mockReturnValue('https://image.url')
}))

describe('TVShowDetailsPage', () => {
  const mockShow = {
    id: 1,
    name: 'Test Show',
    overview: 'Test Overview',
    poster_path: '/test.jpg',
    backdrop_path: '/test-backdrop.jpg',
    first_air_date: '2023-01-01',
    vote_average: 7.5,
    episode_run_time: [45],
    genres: [{ id: 1, name: 'Drama' }],
    tagline: 'Test Tagline',
    status: 'Running',
    number_of_seasons: 2,
    number_of_episodes: 20,
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
    jest.clearAllMocks()
    ;(fetchTMDBApi as jest.Mock).mockImplementation((path) => {
      if (path.includes('/videos')) return Promise.resolve(mockVideos)
      return Promise.resolve(mockShow)
    })
  })

  it('renders TV show details correctly', async () => {
    render(await TVShowDetailsPage({ params: { id: '1' } }))

    expect(screen.getByText('Test Show')).toBeInTheDocument()
    expect(screen.getByText('Test Overview')).toBeInTheDocument()
    expect(screen.getByText('Watch Now')).toBeInTheDocument()
    expect(screen.getByText('Watch Trailer')).toBeInTheDocument()
  })
}) 