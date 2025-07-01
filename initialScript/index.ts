import { PrismaClient } from '@prisma/client'
import envConfig from 'src/shared/config'
import { HashingService } from 'src/shared/services/hashing.service'
import { RoleName } from 'src/shared/constants/role.constants'

const prisma = new PrismaClient()
const hashingService = new HashingService()

async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...')

    // Create basic roles
    const roles = [
      {
        name: 'ADMIN',
        description: 'Administrator role with full access',
        isActive: true,
      },
      {
        name: 'CLIENT',
        description: 'Client role for regular users',
        isActive: true,
      },
      {
        name: 'SELLER',
        description: 'Seller role for shop owners',
        isActive: true,
      },
    ]

    for (const role of roles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name },
      })

      if (!existingRole) {
        await prisma.role.create({
          data: role,
        })
        console.log(`✅ Created role: ${role.name}`)
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`)
      }
    }

    console.log('🎉 Roles seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist')
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin role',
      },
      {
        name: RoleName.Client,
        description: 'Client role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })
  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

seedRoles()

main()
  .then(({ adminUser, createdRoleCount }) => {
    console.log(`Created ${createdRoleCount} roles`)
    console.log(`Created admin user: ${adminUser.email}`)
  })
  .catch(console.error)
