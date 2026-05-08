export declare class DealerInventoryDto {
    productId: string;
    quantityAvailable: number;
    stockFreshnessDays?: number;
    priceAdjustmentPercent?: number;
}
export declare class CreateDealerDto {
    name: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
    fulfillmentPerformance?: number;
    inventory?: DealerInventoryDto[];
}
