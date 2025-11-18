import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/(dashboard)/dashboard/page'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}))

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('access_token', 'mock-token')
  })

  it('shows loading state initially', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Lade Dashboard/i)).toBeInTheDocument()
  })

  it('displays error message when API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Fehler beim Laden/i)).toBeInTheDocument()
    })
  })

  it('renders dashboard with data successfully', async () => {
    const mockData = {
      success: true,
      data: {
        tasks: {
          pending: 5,
          inProgress: 3,
          completed: 12,
        },
        equipment: {
          active: 8,
        },
        materials: {
          lowStock: 2,
        },
        weather: {
          temperature: 18,
        },
        taskTrend: [
          { date: '2025-01-01', completed: 3, created: 5 },
          { date: '2025-01-02', completed: 4, created: 2 },
        ],
        equipmentByType: [
          { type: 'MOWER', hours: 120 },
          { type: 'TRACTOR', hours: 85 },
        ],
        topMaterials: [
          { name: 'Fertilizer A', quantity: 50 },
          { name: 'Seed B', quantity: 30 },
        ],
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Check KPI cards
    expect(screen.getByText('5')).toBeInTheDocument() // Pending tasks
    expect(screen.getByText('8')).toBeInTheDocument() // Active equipment
    expect(screen.getByText('2')).toBeInTheDocument() // Low stock materials
    expect(screen.getByText('18°C')).toBeInTheDocument() // Temperature

    // Check charts are rendered
    expect(screen.getAllByTestId('doughnut-chart')).toHaveLength(1)
    expect(screen.getAllByTestId('line-chart')).toHaveLength(1)
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)

    // Check quick actions
    expect(screen.getByText('Neuer Task')).toBeInTheDocument()
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText('Materialien')).toBeInTheDocument()
    expect(screen.getByText('Berichte')).toBeInTheDocument()
  })

  it('includes authorization header in API request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: {} }),
    } as Response)
    global.fetch = mockFetch

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/reports/dashboard',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-token',
          },
        })
      )
    })
  })

  it('handles missing optional data gracefully', async () => {
    const mockData = {
      success: true,
      data: {
        tasks: {},
        equipment: {},
        materials: {},
        weather: {},
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Should show 0 for missing values
    expect(screen.getAllByText('0')).toHaveLength(3) // Tasks, equipment, materials
    expect(screen.getByText('--°C')).toBeInTheDocument() // Missing temperature
  })
})
