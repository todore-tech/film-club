import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Returns the currently authenticated user based on the Authorization
 * bearer token. This endpoint is useful from server components when you
 * cannot use supabase.auth.getUser on the client directly. If the token is
 * invalid or missing a 401 status is returned.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  return NextResponse.json({ user: data.user });
}