import { createClient } from '@/lib/supabase/server'
import type {
  humor_flavor_step_types,
  llm_input_types,
  llm_models,
  llm_output_types,
} from '@/lib/types/humor-flavor'

export async function getLlmInputTypes(): Promise<llm_input_types[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llm_input_types')
    .select('id, description, slug')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch llm_input_types: ${error.message}`)
  }

  return (data ?? []) as llm_input_types[]
}

export async function getLlmOutputTypes(): Promise<llm_output_types[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llm_output_types')
    .select('id, description, slug')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch llm_output_types: ${error.message}`)
  }

  return (data ?? []) as llm_output_types[]
}

export async function getLlmModels(): Promise<llm_models[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llm_models')
    .select('id, name, provider_model_id, is_temperature_supported')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch llm_models: ${error.message}`)
  }

  return (data ?? []) as llm_models[]
}

export async function getHumorFlavorStepTypes(): Promise<humor_flavor_step_types[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('humor_flavor_step_types')
    .select('id, slug, description')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch humor_flavor_step_types: ${error.message}`)
  }

  return (data ?? []) as humor_flavor_step_types[]
}
