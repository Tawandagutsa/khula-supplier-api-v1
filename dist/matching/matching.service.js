"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
let MatchingService = class MatchingService {
    calculateUnitPrice(product, quantity, region, adjustmentPercent = 0) {
        const tier = this.findPricingTier(product.pricingTiers ?? [], quantity, region);
        const adjustedPrice = Number(tier.pricePerUnit) * (1 + adjustmentPercent / 100);
        return this.roundMoney(adjustedPrice);
    }
    matchDealer(dealers, items, farmer) {
        const candidates = dealers
            .map((dealer) => this.buildFullMatch(dealer, items, farmer))
            .filter((match) => Boolean(match))
            .sort((left, right) => {
            if (left.totalCost !== right.totalCost)
                return left.totalCost - right.totalCost;
            if (left.distanceKm !== right.distanceKm)
                return left.distanceKm - right.distanceKm;
            return this.rankDealer(right.dealer) - this.rankDealer(left.dealer);
        });
        return candidates[0] ?? null;
    }
    buildBackorderPlan(dealers, items, farmer) {
        const allocations = [];
        const remaining = [];
        for (const item of items) {
            let quantityLeft = item.quantity;
            const inventories = dealers
                .flatMap((dealer) => (dealer.inventory ?? [])
                .filter((inventory) => inventory.product.id === item.productId && Number(inventory.quantityAvailable) > 0)
                .map((inventory) => ({ dealer, inventory })))
                .sort((left, right) => this.compareInventoryOptions(left, right, item.quantity, farmer));
            for (const option of inventories) {
                if (quantityLeft <= 0)
                    break;
                const quantity = Math.min(quantityLeft, Number(option.inventory.quantityAvailable));
                const unitPrice = this.calculateUnitPrice(option.inventory.product, quantity, farmer.region, Number(option.inventory.priceAdjustmentPercent));
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
    haversineKm(from, to) {
        const earthRadiusKm = 6371;
        const dLat = this.degreesToRadians(to.latitude - from.latitude);
        const dLon = this.degreesToRadians(to.longitude - from.longitude);
        const lat1 = this.degreesToRadians(from.latitude);
        const lat2 = this.degreesToRadians(to.latitude);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
        return this.roundDistance(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    estimateDeliveryWindow(distanceKm) {
        if (distanceKm <= 25)
            return 'same day';
        if (distanceKm <= 100)
            return '1-2 business days';
        if (distanceKm <= 250)
            return '2-4 business days';
        return '4-7 business days';
    }
    rankDealer(dealer) {
        const performance = Number(dealer.fulfillmentPerformance ?? 80);
        const averageFreshness = this.averageStockFreshness(dealer.inventory ?? []);
        const freshnessScore = Math.max(0, 100 - averageFreshness);
        return this.roundDistance(performance * 0.75 + freshnessScore * 0.25);
    }
    buildFullMatch(dealer, items, farmer) {
        const allocations = [];
        for (const item of items) {
            const inventory = (dealer.inventory ?? []).find((stock) => stock.product.id === item.productId && Number(stock.quantityAvailable) >= item.quantity);
            if (!inventory) {
                return null;
            }
            const unitPrice = this.calculateUnitPrice(inventory.product, item.quantity, farmer.region, Number(inventory.priceAdjustmentPercent));
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
    compareInventoryOptions(left, right, quantity, farmer) {
        const leftPrice = this.calculateUnitPrice(left.inventory.product, quantity, farmer.region, Number(left.inventory.priceAdjustmentPercent));
        const rightPrice = this.calculateUnitPrice(right.inventory.product, quantity, farmer.region, Number(right.inventory.priceAdjustmentPercent));
        if (leftPrice !== rightPrice)
            return leftPrice - rightPrice;
        const leftDistance = this.haversineKm(farmer, left.dealer);
        const rightDistance = this.haversineKm(farmer, right.dealer);
        if (leftDistance !== rightDistance)
            return leftDistance - rightDistance;
        return this.rankDealer(right.dealer) - this.rankDealer(left.dealer);
    }
    findPricingTier(tiers, quantity, region) {
        const matchingTier = (candidateRegion) => [...tiers]
            .sort((left, right) => Number(right.minQuantity) - Number(left.minQuantity))
            .find((tier) => tier.region.toLowerCase() === candidateRegion.toLowerCase() &&
            quantity >= Number(tier.minQuantity) &&
            (tier.maxQuantity === null || quantity <= Number(tier.maxQuantity)));
        const tier = matchingTier(region) ?? matchingTier('default');
        if (!tier) {
            throw new Error(`No pricing tier configured for quantity ${quantity}`);
        }
        return tier;
    }
    averageStockFreshness(inventory) {
        if (!inventory.length)
            return 100;
        const totalDays = inventory.reduce((sum, item) => sum + Number(item.stockFreshnessDays ?? 0), 0);
        return totalDays / inventory.length;
    }
    degreesToRadians(value) {
        return (value * Math.PI) / 180;
    }
    roundMoney(value) {
        return Math.round(value * 100) / 100;
    }
    roundDistance(value) {
        return Math.round(value * 100) / 100;
    }
    roundQuantity(value) {
        return Math.round(value * 1000) / 1000;
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)()
], MatchingService);
//# sourceMappingURL=matching.service.js.map