import { Product } from './product.entity';
export declare class PricingTier {
    id: string;
    region: string;
    minQuantity: number;
    maxQuantity: number | null;
    pricePerUnit: number;
    product: Product;
}
