import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserModel = z.infer<typeof UserSchema>

// Omit password from the response type
export const UserResponseSchema = UserSchema.omit({ password: true })
export type UserResponse = z.infer<typeof UserResponseSchema>
