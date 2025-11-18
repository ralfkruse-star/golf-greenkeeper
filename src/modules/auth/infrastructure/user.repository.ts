/**
 * User Repository
 */

import { UserRole } from '@/types'
import prisma from '@/lib/db'

export interface CreateUserDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

export class UserRepository {
  async create(dto: CreateUserDTO) {
    return prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      },
    })
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async findMany() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(id: string, data: Partial<CreateUserDTO>) {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  async deactivate(id: string) {
    return prisma.user.update({
      where: { id },
      data: { active: false },
    })
  }
}
