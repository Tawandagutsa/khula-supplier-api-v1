import { Dealer } from '../dealers/entities/dealer.entity';
import { Product } from '../products/entities/product.entity';
export interface FarmerLocation {
    latitude: number;
    longitude: number;
    region: string;
}
export interface MatchRequestItem {
    productId: string;
    quantity: number;
}
export interface DealerMatch {
    dealer: Dealer;
    totalCost: number;
    distanceKm: number;
    estimatedDeliveryWindow: string;
    allocations: MatchAllocation[];
}
export interface MatchAllocation {
    dealer: Dealer;
    product: Product;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
export interface BackorderPlan {
    totalCost: number;
    allocations: MatchAllocation[];
    remaining: Array<{
        productId: string;
        quantity: number;
    }>;
}
export declare class MatchingService {
    calculateUnitPrice(product: Product, quantity: number, region: string, adjustmentPercent?: number): number;
    matchDealer(dealers: Dealer[], items: MatchRequestItem[], farmer: FarmerLocation): DealerMatch | null;
    buildBackorderPlan(dealers: Dealer[], items: MatchRequestItem[], farmer: FarmerLocation): BackorderPlan;
    haversineKm(from: Pick<FarmerLocation, 'latitude' | 'longitude'>, to: Pick<FarmerLocation, 'latitude' | 'longitude'>): number;
    estimateDeliveryWindow(distanceKm: number): string;
    rankDealer(dealer: Dealer): number;
    private buildFullMatch;
    private compareInventoryOptions;
    private findPricingTier;
    private averageStockFreshness;
    private degreesToRadians;
    private roundMoney;
    private roundDistance;
    private roundQuantity;
}
