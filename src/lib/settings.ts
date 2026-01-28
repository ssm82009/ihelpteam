import { db } from './db';

export async function getSiteSettings() {
    try {
        const result = await db.execute('SELECT * FROM site_settings');
        const settings: Record<string, string> = {};
        result.rows.forEach(row => {
            settings[row.key as string] = row.value as string;
        });
        return settings;
    } catch (e) {
        return {};
    }
}

export async function getPaymentSettings() {
    try {
        const result = await db.execute('SELECT * FROM payment_settings');
        const settings: Record<string, string> = {};
        result.rows.forEach(row => {
            settings[row.key as string] = row.value as string;
        });
        return settings;
    } catch (e) {
        return {};
    }
}

export async function getSubPlans() {
    try {
        const result = await db.execute('SELECT * FROM subscription_plans ORDER BY price ASC');
        return result.rows;
    } catch (e) {
        return [];
    }
}
