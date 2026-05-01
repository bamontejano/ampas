import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkData() {
    console.log('--- AMPAS ---')
    const { data: ampas } = await supabase.from('ampas').select('id, nombre, slug')
    console.log(ampas)

    console.log('\n--- RECURSOS ---')
    const { data: recursos } = await supabase.from('recursos').select('id, titulo, ampa_id')
    console.log(recursos)

    console.log('\n--- POSTS ---')
    const { data: posts } = await supabase.from('posts').select('id, contenido, ampa_id')
    console.log(posts)
}

checkData()
