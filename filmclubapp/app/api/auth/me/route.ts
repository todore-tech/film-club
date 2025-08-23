// app/api/auth/me/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Returns the current user if a Bearer token is sent (or just { user: null }).
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    let user: any = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data, error } = await supabase.auth.getUser(token)
      if (!error) user = data.user
    }

    return NextResponse.json({ user })
  } catch (e) {
    // Never crash build/runtime because of this route
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
