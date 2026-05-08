import { Injectable } from '@nestjs/common';
import { DealerInventory } from '../dealers/entities/dealer-inventory.entity';
import { Dealer } from '../dealers/entities/dealer.entity';
import { PricingTier } from '../products/entities/pricing-tier.entity';
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
  remaining: Array<{ productId: string; quantity: number }>;
}

@Injectable()
export class MatchingService {
  calculateUnitPrice(product: Product, quantity: number, region: string, adjustmentPercent = 0): number {
    const tier = this.findPricingTier(product.pricingTiers ?? [], quantity, region);
    const adjustedPrice = Number(tier.pricePerUnit) * (1 + adjustmentPercent / 100);
    return this.roundMoney(adjustedPrice);
  }

  matchDealer(dealers: Dealer[], items: MatchRequestItem[], farmer: FarmerLocation): DealerMatch | null {
    const candidates = dealers
      .map((dealer) => this.buildFullMatch(dealer, items, farmer))
      .filter((match): match is DealerMatch => Boolean(match))
      .sort((left, right) => {
        if (left.totalCost !== right.totalCost) return left.totalCost - right.totalCost;
        if (left.distanceKm !== right.distanceKm) return left.distanceKm - right.distanceKm;
        return this.rankDealer(right.dealer) - this.rankDealer(left.dealer);
      });

    return candidates[0] ?? null;
  }

  buildBackorderPlan(dealers: Dealer[], items: MatchRequestItem[], farmer: FarmerLocation): BackorderPlan {
    const allocations: MatchAllocation[] = [];
    const remaining: Array<{ productId: string; quantity: number }> = [];

    for (const item of items) {
      let quantityLeft = item.quantity;
      const inventories = dealers
        .flatMap((dealer) =>
          (dealer.inventory ?? [])
            .filter((inventory) => inventory.product.id === item.productId && Number(inventory.quantityAvailable) > 0)
            .map((inventory) => ({ dealer, inventory })),
        )
        .sort((left, right) => this.compareInventoryOptions(left, right, item.quantity, farmer));

      for (const option of inventories) {
        if (quantityLeft <= 0) break;

        const quantity = Math.min(quantityLeft, Number(option.inventory.quantityAvailable));
        const unitPrice = this.calculateUnitPrice(
          option.inventory.product,
          quantity,
          farmer.region,
          Number(option.inventory.priceAdjustmentPercent),
        );

        allocations.push({
          dealer: option.dealer,
          product: option.inventory.product,
          quantity,
          unitPrice,
          lineTotal: this.roundMoney(unitPrice * quantity),
        });
        quantityLeft = this.roundQuantity(quantityLeft - quantity);
      }

      if (quantityLeft > 0) {
        remaining.push({ productId: item.productId, quantity: quantityLeft });
      }
    }

    return {
      totalCost: this.roundMoney(allocations.reduce((sum, allocation) => sum + allocation.lineTotal, 0)),
      allocations,
      remaining,
    };
  }

  haversineKm(from: Pick<FarmerLocation, 'latitude' | 'longitude'>, to: Pick<FarmerLocation, 'latitude' | 'longitude'>): number {
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(to.latitude - from.latitude);
    const dLon = this.degreesToRadians(to.longitude - from.longitude);
    const lat1 = this.degreesToRadians(from.latitude);
    const lat2 = this.degreesToRadians(to.latitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return this.roundDistance(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  estimateDeliveryWindow(distanceKm: number): string {
    if (distanceKm <= 25) return 'same day';
    if (distanceKm <= 100) return '1-2 business days';
    if (distanceKm <= 250) return '2-4 business days';
    return '4-7 business days';
  }

  rankDealer(dealer: Dealer): number {
    const performance = Number(dealer.fulfillmentPerformance ?? 80);
    const averageFreshness = this.averageStockFreshness(dealer.inventory ?? []);
    const freshnessScore = Math.max(0, 100 - averageFreshness);
    return this.roundDistance(performance * 0.75 + freshnessScore * 0.25);
  }

  private buildFullMatch(dealer: Dealer, items: MatchRequestItem[], farmer: FarmerLocation): DealerMatch | null {
    const allocations: MatchAllocation[] = [];

    for (const item of items) {
      const inventory = (dealer.inventory ?? []).find(
        (stock) => stock.product.id === item.productId && Number(stock.quantityAvailable) >= item.quantity,
      );

      if (!inventory) {
        return null;
      }

      const unitPrice = this.calculateUnitPrice(
        inventory.product,
        item.quantity,
        farmer.region,
        Number(inventory.priceAdjustmentPercent),
      );
      allocations.push({
        dealer,
        product: inventory.product,
        quantity: item.quantity,
        unitPrice,
        lineTotal: this.roundMoney(unitPrice * item.quantity),
      });
    }

    const distanceKm = this.haversineKm(farmer, dealer);
    return {
      dealer,
      totalCost: this.roundMoney(allocations.reduce((sum, allocation) => sum + allocation.lineTotal, 0)),
      distanceKm,
      estimatedDeliveryWindow: this.estimateDeliveryWindow(distanceKm),
      allocations,
    };
  }

  private compareInventoryOptions(
    left: { dealer: Dealer; inventory: DealerInventory },
    right: { dealer: Dealer; inventory: DealerInventory },
    quantity: number,
    farmer: FarmerLocation,
  ): number {
    const leftPrice = this.calculateUnitPrice(left.inventory.product, quantity, farmer.region, Number(left.inventory.priceAdjustmentPercent));
    const rightPrice = this.calculateUnitPrice(right.inventory.product, quantity, farmer.region, Number(right.inventory.priceAdjustmentPercent));
    if (leftPrice !== rightPrice) return leftPrice - rightPrice;

    const leftDistance = this.haversineKm(farmer, left.dealer);
    const rightDistance = this.haversineKm(farmer, right.dealer);
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;

    return this.rankDealer(right.dealer) - this.rankDealer(left.dealer);
  }

  private findPricingTier(tiers: PricingTier[], quantity: number, region: string): PricingTier {
    const matchingTier = (candidateRegion: string) =>
      [...tiers]
        .sort((left, right) => Number(right.minQuantity) - Number(left.minQuantity))
        .find(
          (tier) =>
            tier.region.toLowerCase() === candidateRegion.toLowerCase() &&
            quantity >= Number(tier.minQuantity) &&
            (tier.maxQuantity === null || quantity <= Number(tier.maxQuantity)),
        );

    const tier = matchingTier(region) ?? matchingTier('default');
    if (!tier) {
      throw new Error(`No pricing tier configured for quantity ${quantity}`);
    }
    return tier;
  }

  private averageStockFreshness(inventory: DealerInventory[]): number {
    if (!inventory.length) return 100;
    const totalDays = inventory.reduce((sum, item) => sum + Number(item.stockFreshnessDays ?? 0), 0);
    return totalDays / inventory.length;
  }

  private degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private roundDistance(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private roundQuantity(value: number): number {
    return Math.round(value * 1000) / 1000;
  }
}
