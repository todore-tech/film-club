export const ALLOWED_AGE_GROUPS = ['15-17', '20-40', '55+'] as const
export type AgeGroup = (typeof ALLOWED_AGE_GROUPS)[number]
export const isAgeGroup = (v: unknown): v is AgeGroup =>
  typeof v === 'string' && (ALLOWED_AGE_GROUPS as readonly string[]).includes(v)

