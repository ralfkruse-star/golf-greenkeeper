/**
 * Material Entity - Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Material, MaterialProps } from '@/modules/materials/domain/material.entity'
import { MaterialType } from '@/types'
import { BusinessRuleViolationError } from '@/lib/errors'

describe('Material Entity', () => {
  let defaultProps: MaterialProps

  beforeEach(() => {
    defaultProps = {
      id: 'material-1',
      code: 'MAT-001',
      name: 'NPK Fertilizer 15-15-15',
      type: MaterialType.FERTILIZER,
      manufacturer: 'GreenCare',
      unit: 'kg',
      currentStock: 500,
      minStock: 100,
      unitCost: 2.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  describe('Material Creation', () => {
    it('should create a material with valid properties', () => {
      const material = new Material(defaultProps)

      expect(material.id).toBe('material-1')
      expect(material.code).toBe('MAT-001')
      expect(material.name).toBe('NPK Fertilizer 15-15-15')
      expect(material.currentStock).toBe(500)
    })
  })

  describe('Stock Management', () => {
    it('should add stock', () => {
      const material = new Material(defaultProps)

      material.addStock(100, 'Purchase order #123')

      expect(material.currentStock).toBe(600)
    })

    it('should not add negative stock', () => {
      const material = new Material(defaultProps)

      expect(() => material.addStock(-50, 'Invalid')).toThrow(BusinessRuleViolationError)
    })

    it('should remove stock', () => {
      const material = new Material(defaultProps)

      material.removeStock(100, 'Application on Green 1')

      expect(material.currentStock).toBe(400)
    })

    it('should not remove more stock than available', () => {
      const material = new Material(defaultProps)

      expect(() => material.removeStock(600, 'Too much')).toThrow(BusinessRuleViolationError)
      expect(() => material.removeStock(600, 'Too much')).toThrow('Insufficient stock')
    })

    it('should not remove negative stock', () => {
      const material = new Material(defaultProps)

      expect(() => material.removeStock(-50, 'Invalid')).toThrow(BusinessRuleViolationError)
    })

    it('should check if stock is low', () => {
      const material = new Material(defaultProps)

      expect(material.isStockLow()).toBe(false)

      material.removeStock(450)
      expect(material.currentStock).toBe(50)
      expect(material.isStockLow()).toBe(true)
    })

    it('should not flag low stock if no minimum is set', () => {
      const material = new Material({
        ...defaultProps,
        currentStock: 10,
        minStock: undefined,
      })

      expect(material.isStockLow()).toBe(false)
    })
  })

  describe('Material Updates', () => {
    it('should update material details', () => {
      const material = new Material(defaultProps)

      material.updateDetails({
        name: 'NPK Premium 20-20-20',
        unitCost: 3.0,
        minStock: 150,
      })

      expect(material.toJSON.name).toBe('NPK Premium 20-20-20')
      expect(material.toJSON.unitCost).toBe(3.0)
      expect(material.toJSON.minStock).toBe(150)
    })
  })

  describe('Safety Information', () => {
    it('should check if material requires PPE', () => {
      const pesticide = new Material({
        ...defaultProps,
        type: MaterialType.PESTICIDE,
        safetyInfo: 'Requires gloves and mask',
      })

      expect(pesticide.requiresSafetyInfo()).toBe(true)

      const sand = new Material({
        ...defaultProps,
        type: MaterialType.SAND,
        safetyInfo: undefined,
      })

      expect(sand.requiresSafetyInfo()).toBe(false)
    })

    it('should flag hazardous materials', () => {
      const pesticide = new Material({
        ...defaultProps,
        type: MaterialType.PESTICIDE,
      })

      const fertilizer = new Material({
        ...defaultProps,
        type: MaterialType.FERTILIZER,
      })

      const sand = new Material({
        ...defaultProps,
        type: MaterialType.SAND,
      })

      expect(pesticide.isHazardous()).toBe(true)
      expect(fertilizer.isHazardous()).toBe(false)
      expect(sand.isHazardous()).toBe(false)
    })
  })
})
