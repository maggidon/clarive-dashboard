import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabase } from '../lib/supabase'
import RecoveriesClient from './RecoveriesClient'

export default async function RecoveriesPage() {
  const cookieStore = await cookies()

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const { data: clinicUser } = await authClient
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  const clinicId = clinicUser?.clinic_id ?? 'pinehurst_dental'

  const { data: recoveries } = await supabase
    .from('recoveries')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('recovery_triggered_at', { ascending: false })

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single()

  return <RecoveriesClient recoveries={recoveries ?? []} calls={calls ?? []} clinic={clinic} />
}