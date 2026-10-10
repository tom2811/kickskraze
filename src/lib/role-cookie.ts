export const ROLE_COOKIE = 'kk_role';

export function roleCookieOptions(role: 'USER' | 'ADMIN') {
  return {
    name: ROLE_COOKIE,
    value: role,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  };
}
