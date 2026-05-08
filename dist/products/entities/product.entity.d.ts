import { PricingTier } from './pricing-tier.entity';
export declare class Product {
    id: string;
    name: string;
    category: string;
    unit: string;
    pricingTiers: PricingTier[];
    createdAt: Date;
    updatedAt: Date;
}
