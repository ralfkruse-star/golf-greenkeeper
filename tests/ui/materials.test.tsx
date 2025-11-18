import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MaterialsPage from '@/app/(dashboard)/dashboard/materials/page'

describe('Materials Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('access_token', 'mock-token')

    // Mock window.prompt for add stock functionality
    window.prompt = vi.fn()
  })

  it('shows loading state initially', () => {
    render(<MaterialsPage />)
    expect(screen.getByText(/Lade Materialien/i)).toBeInTheDocument()
  })

  it('renders materials list successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Premium Dünger NPK 15-15-15',
          type: 'FERTILIZER',
          unit: 'kg',
          currentStock: 50,
          minStock: 10,
          maxStock: 100,
          costPerUnit: 12.5,
          isHazardous: false,
        },
        {
          id: '2',
          name: 'Pflanzenschutzmittel X',
          type: 'PESTICIDE',
          unit: 'L',
          currentStock: 5,
          minStock: 10,
          maxStock: 50,
          costPerUnit: 45.0,
          isHazardous: true,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText('Materialien')).toBeInTheDocument()
    })

    // Check material cards
    expect(screen.getByText('Premium Dünger NPK 15-15-15')).toBeInTheDocument()
    expect(screen.getByText('Pflanzenschutzmittel X')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument() // Stock
    expect(screen.getByText('5')).toBeInTheDocument() // Stock
  })

  it('shows low stock indicator correctly', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Low Stock Item',
          type: 'FERTILIZER',
          unit: 'kg',
          currentStock: 5,
          minStock: 10,
          maxStock: 100,
          costPerUnit: 10,
          isHazardous: false,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText('Niedrig')).toBeInTheDocument()
    })
  })

  it('displays hazardous material warning', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Hazardous Material',
          type: 'PESTICIDE',
          unit: 'L',
          currentStock: 20,
          minStock: 10,
          maxStock: 50,
          costPerUnit: 50,
          isHazardous: true,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      // Hazardous materials show warning emoji
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
  })

  it('filters materials by type', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Fertilizer',
          type: 'FERTILIZER',
          unit: 'kg',
          currentStock: 50,
          minStock: 10,
          maxStock: 100,
          costPerUnit: 10,
          isHazardous: false,
        },
        {
          id: '2',
          name: 'Pesticide',
          type: 'PESTICIDE',
          unit: 'L',
          currentStock: 20,
          minStock: 5,
          maxStock: 50,
          costPerUnit: 45,
          isHazardous: true,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText('Fertilizer')).toBeInTheDocument()
      expect(screen.getByText('Pesticide')).toBeInTheDocument()
    })

    // Click FERTILIZER filter
    const fertilizerFilter = screen.getByRole('button', { name: /FERTILIZER/i })
    fireEvent.click(fertilizerFilter)

    // Should only show fertilizer
    expect(screen.getByText('Fertilizer')).toBeInTheDocument()
    expect(screen.queryByText('Pesticide')).not.toBeInTheDocument()
  })

  it('shows new material form when button clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText('Materialien')).toBeInTheDocument()
    })

    // Click "Neues Material" button
    const newButton = screen.getByRole('button', { name: /Neues Material/i })
    fireEvent.click(newButton)

    // Form should appear
    expect(screen.getByText('Neues Material erstellen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Premium Dünger/i)).toBeInTheDocument()
  })

  it('calculates total value correctly', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: '1',
          name: 'Material',
          type: 'FERTILIZER',
          unit: 'kg',
          currentStock: 10,
          minStock: 5,
          maxStock: 50,
          costPerUnit: 12.5,
          isHazardous: false,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockData,
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      // Total value = 10 * 12.5 = 125.00
      expect(screen.getByText('125.00 €')).toBeInTheDocument()
    })
  })

  it('handles add stock functionality', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [{
            id: '1',
            name: 'Material',
            type: 'FERTILIZER',
            unit: 'kg',
            currentStock: 10,
            minStock: 5,
            maxStock: 50,
            costPerUnit: 10,
            isHazardous: false,
          }],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      })

    global.fetch = mockFetch
    window.prompt = vi.fn().mockReturnValue('20')

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText('Material')).toBeInTheDocument()
    })

    // Click "Hinzufügen" button
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith('Menge hinzufügen:')
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/materials/1/add',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ quantity: 20 }),
        })
      )
    })
  })

  it('shows empty state when no materials', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    } as Response)

    render(<MaterialsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Keine Materialien gefunden/i)).toBeInTheDocument()
    })
  })
})
