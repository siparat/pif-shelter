import { WishlistItemStatusEnum } from '@pif/shared';
import z from 'zod';

export const wishlistItemStatusSchema = z.enum(WishlistItemStatusEnum);
