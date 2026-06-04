import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

const TENANT_ID = () => {
  const id = process.env.TEST_TENANT_ID
  if (!id) throw new Error('TEST_TENANT_ID is not set in .env.test')
  return id
}

/**
 * Deletes all products (and their related records) for the test tenant.
 * The tenant itself is NOT deleted — only its data.
 *
 * Safe to call in beforeAll / afterAll of any describe block.
 */
export async function cleanupTestProducts(): Promise<void> {
  const tenantId = TENANT_ID()

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('tenant_id', tenantId)

  if (!products || products.length === 0) return

  const ids = products.map((p: { id: string }) => p.id)

  // Delete related records first (FK constraints)
  await Promise.all([
    supabaseAdmin.from('publish_logs').delete().in('product_id', ids),
    supabaseAdmin.from('pipeline_jobs').delete().in('product_id', ids),
  ])

  await supabaseAdmin.from('products').delete().eq('tenant_id', tenantId)
}
