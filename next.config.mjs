/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    // إعدادات الكاش لتجنب مشاكل Cloudflare
    async headers() {
        return [
            {
                // منع تخزين صفحات HTML - إعادة التحقق دائماً
                source: '/((?!_next/static|_next/image|favicon.ico).*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },
                ],
            },
            {
                // السماح بتخزين الملفات الثابتة (JS/CSS/Images) لأنها تحتوي على hash
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
