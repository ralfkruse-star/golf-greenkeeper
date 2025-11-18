import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EquipmentPage from '@/app/(dashboard)/dashboard/equipment/page'

describe('Equipment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('access_token', 'mock-token')
  })

  it('shows loading state initially', () => {
    render(<EquipmentPage />)
    expect(screen.getByText(/Lade Equipment/i)).toBeInTheDocument()
  })

  it('renders equipment list successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Rasenmäher Toro 2000',
          type: 'MOWER',
          status: 'ACTIVE',
          operatingHours: 120,
          lastMaintenance: '2025-01-01',
          nextMaintenance: '2025-02-01',
        },
        {
          id: '2',
          name: 'Traktor John Deere',
          type: 'TRACTOR',
          status: 'IN_USE',
          operatingHours: 85,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument()
    })

    // Check equipment cards
    expect(screen.getByText('Rasenmäher Toro 2000')).toBeInTheDocument()
    expect(screen.getByText('Traktor John Deere')).toBeInTheDocument()
    expect(screen.getByText('120h')).toBeInTheDocument()
    expect(screen.getByText('85h')).toBeInTheDocument()
  })

  it('filters equipment by status', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Equipment 1',
          type: 'MOWER',
          status: 'ACTIVE',
          operatingHours: 100,
        },
        {
          id: '2',
          name: 'Equipment 2',
          type: 'TRACTOR',
          status: 'MAINTENANCE',
          operatingHours: 200,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText('Equipment 1')).toBeInTheDocument()
      expect(screen.getByText('Equipment 2')).toBeInTheDocument()
    })

    // Click MAINTENANCE filter
    const maintenanceFilter = screen.getByRole('button', { name: /MAINTENANCE/i })
    fireEvent.click(maintenanceFilter)

    // Should only show maintenance equipment
    expect(screen.queryByText('Equipment 1')).not.toBeInTheDocument()
    expect(screen.getByText('Equipment 2')).toBeInTheDocument()
  })

  it('shows new equipment form when button clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    } as Response)

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument()
    })

    // Click "Neues Equipment" button
    const newButton = screen.getByRole('button', { name: /Neues Equipment/i })
    fireEvent.click(newButton)

    // Form should appear
    expect(screen.getByText('Neues Equipment erstellen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Rasenmäher Toro/i)).toBeInTheDocument()
  })

  it('creates new equipment successfully', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            id: '3',
            name: 'New Mower',
            type: 'MOWER',
            status: 'ACTIVE',
            operatingHours: 0,
          },
        }),
      })

    global.fetch = mockFetch

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument()
    })

    // Open form
    fireEvent.click(screen.getByRole('button', { name: /Neues Equipment/i }))

    // Fill form
    await user.type(screen.getByPlaceholderText(/Rasenmäher Toro/i), 'New Mower')
    await user.type(screen.getByLabelText(/Kaufdatum/i), '2025-01-15')
    await user.clear(screen.getByLabelText(/Wartungsintervall/i))
    await user.type(screen.getByLabelText(/Wartungsintervall/i), '150')

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Erstellen/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/equipment',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  it('shows empty state when no equipment', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    } as Response)

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText(/Kein Equipment gefunden/i)).toBeInTheDocument()
    })
  })

  it('displays correct status badges', async () => {
    const mockData = {
      success: true,
      data: [
        { id: '1', name: 'Eq1', type: 'MOWER', status: 'ACTIVE', operatingHours: 100 },
        { id: '2', name: 'Eq2', type: 'MOWER', status: 'MAINTENANCE', operatingHours: 100 },
        { id: '3', name: 'Eq3', type: 'MOWER', status: 'RETIRED', operatingHours: 100 },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<EquipmentPage />)

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText('MAINTENANCE')).toBeInTheDocument()
      expect(screen.getByText('RETIRED')).toBeInTheDocument()
    })
  })
})
