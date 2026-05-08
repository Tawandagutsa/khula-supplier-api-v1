export declare class CreatePricingTierDto {
    region?: string;
    minQuantity: number;
    maxQuantity?: number | null;
    pricePerUnit: number;
}
export declare class CreateProductDto {
    name: string;
    category: string;
    unit?: string;
    pricingTiers: CreatePricingTierDto[];
}
