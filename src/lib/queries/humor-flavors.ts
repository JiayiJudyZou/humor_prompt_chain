import { createClient } from '@/lib/supabase/server'
import type {
  humor_flavor_steps,
  humor_flavors,
} from '@/lib/types/humor-flavor'

export async function getHumorFlavors(): Promise<humor_flavors[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('modified_datetime_utc', { ascending: false })
    .order('id', { ascending: false })

  console.log('getHumorFlavors error:', error)
  console.log('getHumorFlavors count:', data?.length ?? 0)
  console.log('getHumorFlavors sample:', data?.slice(0, 3))

  if (error) {
    throw new Error(`Failed to fetch humor_flavors: ${error.message}`)
  }

  return (data ?? []) as humor_flavors[]
}

export async function getHumorFlavorById(id: number): Promise<humor_flavors> {
  const supabase = await createClient()

  console.log('SUPABASE URL', process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { data, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', id)
    .single<humor_flavors>()

  if (error) {
    throw new Error(`Failed to fetch humor_flavors row ${id}: ${error.message}`)
  }

  return data
}

export async function getHumorFlavorSteps(
  humorFlavorId: number,
): Promise<humor_flavor_steps[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('humor_flavor_id', humorFlavorId)
    .order('order_by', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    throw new Error(
      `Failed to fetch humor_flavor_steps for humor_flavor_id ${humorFlavorId}: ${error.message}`,
    )
  }

  return (data ?? []) as humor_flavor_steps[]
}

export async function getHumorFlavorWithSteps(
  id: number,
): Promise<{ flavor: humor_flavors; steps: humor_flavor_steps[] }> {
  const [flavor, steps] = await Promise.all([
    getHumorFlavorById(id),
    getHumorFlavorSteps(id),
  ])

  return { flavor, steps }
}
