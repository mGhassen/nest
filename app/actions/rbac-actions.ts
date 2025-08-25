'use server'

import { getUserWithRole } from "@/lib/rbac"

export async function getUserRoleAction(userId: string) {
  if (!userId) return null
  return await getUserWithRole(userId)
}
