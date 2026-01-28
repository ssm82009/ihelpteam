import { cookies } from 'next/headers';

const ADMIN_EMAIL = '56eeer@gmail.com';

export function isAdmin() {
    const session = cookies().get('admin_session')?.value;
    if (!session) return false;

    try {
        const decoded = atob(session);
        const [email, secret] = decoded.split(':');

        const adminSecret = process.env.ADMIN_TOKEN_SECRET || 'fallback_secret';

        return email === ADMIN_EMAIL && secret === adminSecret;
    } catch (e) {
        return false;
    }
}
