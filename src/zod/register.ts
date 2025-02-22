import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().max(50),
    handle: z.string().max(50)
})