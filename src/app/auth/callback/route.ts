import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/login', origin))
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', origin))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin, is_matrix_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.redirect(new URL('/login', origin))
    }

    if (profile?.is_superadmin || profile?.is_matrix_admin) {
      return NextResponse.redirect(new URL('/admin/humor-flavors', origin))
    }

    return NextResponse.redirect(new URL('/unauthorized', origin))
  } catch {
    return NextResponse.redirect(new URL('/login', origin))
  }
}
