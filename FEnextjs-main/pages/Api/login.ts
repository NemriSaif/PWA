import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🟢 [API] /api/login called:', req.method);

  if (req.method !== 'POST') {
    console.warn('⚠️  Invalid method:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body ?? {};
    console.log('📩 [API] Received body:', { username, hasPassword: !!password });

    // Proxy request to NestJS backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
    console.log('🌍 [API] Calling backend:', backendUrl);

    const r = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await r.json().catch((e) => {
      console.error('❌ [API] JSON parse error:', e);
      return {};
    });

    console.log('📥 [API] Backend response status:', r.status, 'data:', data);

    if (!r.ok) {
      console.error('🚫 [API] Backend returned error:', data);
      return res.status(r.status).json({ message: data?.message || 'Login failed' });
    }

    const token = data.access_token;
    console.log('🔑 [API] Token received length:', token?.length);

    res.setHeader(
      'Set-Cookie',
      serialize(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60,
      })
    );

    console.log('✅ [API] Cookie set successfully');
    return res.status(200).json({ user: data.user });
  } catch (err: any) {
    console.error('🔥 [API] Unexpected error:', err);
    return res.status(500).json({ message: err?.message || 'Server error' });
  }
}