import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    
    return response;
  } catch (error: any) {
    console.error('Error creating session cookie:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal Server Error', detail: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.delete('session');
  return response;
}
