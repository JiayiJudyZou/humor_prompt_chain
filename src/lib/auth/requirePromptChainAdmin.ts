import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type PromptChainAdminProfile = {
  id: string
  is_superadmin: boolean | null
  is_matrix_admin: boolean | null
}

export async function requirePromptChainAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_superadmin, is_matrix_admin')
    .eq('id', user.id)
    .single<PromptChainAdminProfile>()

  const isAuthorized = Boolean(profile?.is_superadmin || profile?.is_matrix_admin)

  if (!isAuthorized) {
    redirect('/')
  }

  return { user, profile }
}
