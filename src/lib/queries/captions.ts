import { createClient } from '@/lib/supabase/server'

type captions = {
  id: number
  humor_flavor_id: number | null
  created_datetime_utc?: string | null
  [key: string]: unknown
}

type QueryError = {
  message: string
  code?: string
}

function isMissingCreatedDatetimeColumn(error: QueryError): boolean {
  if (error.code === '42703') {
    return true
  }

  return /created_datetime_utc/i.test(error.message)
}

export async function getCaptionsByHumorFlavorId(
  humorFlavorId: number,
): Promise<captions[]> {
  const supabase = await createClient()

  const buildBaseQuery = () =>
    supabase
      .from('captions')
      .select('*')
      .eq('humor_flavor_id', humorFlavorId)
      .not('humor_flavor_id', 'is', null)

  const orderedByCreatedDatetime = await buildBaseQuery().order(
    'created_datetime_utc',
    {
      ascending: false,
    },
  )

  if (!orderedByCreatedDatetime.error) {
    return (orderedByCreatedDatetime.data ?? []) as captions[]
  }

  if (isMissingCreatedDatetimeColumn(orderedByCreatedDatetime.error)) {
    const orderedById = await buildBaseQuery().order('id', { ascending: false })

    if (orderedById.error) {
      throw new Error(
        `Failed to fetch captions for humor_flavor_id ${humorFlavorId}: ${orderedById.error.message}`,
      )
    }

    return (orderedById.data ?? []) as captions[]
  }

  throw new Error(
    `Failed to fetch captions for humor_flavor_id ${humorFlavorId}: ${orderedByCreatedDatetime.error.message}`,
  )
}
