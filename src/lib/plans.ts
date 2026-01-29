export const PLANS = {
    free: {
        name: 'الباقة المجانية',
        maxTeams: 1,
        maxMembers: 5,
        price: 0,
        duration: 'unlimited',
    },
    pro: {
        name: 'اشتراك مساعد الفريق - سنوي',
        maxTeams: 10,
        maxMembers: 10,
        price: 9,
        duration: '1 year',
    }
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanLimits(plan: PlanType = 'free') {
    return PLANS[plan] || PLANS.free;
}
