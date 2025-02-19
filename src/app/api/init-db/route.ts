import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create the setup function if it doesn't exist
    const createFunctionSQL = `
      create or replace function setup_database(setup_sql text)
      returns void
      language plpgsql
      security definer
      as $$
      begin
        execute setup_sql;
      end;
      $$;

      -- Grant execute permission to authenticated users
      grant execute on function setup_database(text) to authenticated;
    `

    const { error: createFnError } = await supabase.rpc('exec_sql', {
      sql: createFunctionSQL
    })

    if (createFnError) {
      console.error('Error creating setup function:', createFnError)
      return NextResponse.json({ error: 'Failed to create setup function' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in init-db route:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
