import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}

export const getCurrentUser = async () => {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
