import { supabase } from './lib/supabase'
import Dashboard from './components/Dashboard'

async function getData() {
  const clinicId = 'pinehurst_dental'

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single()

  return { calls: calls ?? [], clinic }
}

export default async function Page() {
  const { calls, clinic } = await getData()
  return <Dashboard calls={calls} clinic={clinic} />
}