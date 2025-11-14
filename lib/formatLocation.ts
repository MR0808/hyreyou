import { z } from 'zod';

export const LocationSchema = z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(2, 'Country is required')
});

export type Location = z.infer<typeof LocationSchema>;

export function formatLocation({ city, state, country }: Location) {
    return state && state.trim() !== ''
        ? `${city}, ${state}, ${country}`
        : `${city}, ${country}`;
}
