import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkData() {
    console.log('--- AMPAS ---')
    const { data: ampas } = await supabase.from('ampas').select('id, nombre, slug')
    console.log(ampas)
}

checkData()
