import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successful email confirmation, create session
      await fetch(`${origin}/api/session`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });
      
      // Redirect to home with success message
      return NextResponse.redirect(`${origin}/?verified=true`);
    }
  }

  // Redirect to login on error
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
