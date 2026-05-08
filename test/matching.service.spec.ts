import { Dealer } from '../src/dealers/entities/dealer.entity';
import { Product } from '../src/products/entities/product.entity';
import { MatchingService } from '../src/matching/matching.service';

describe('MatchingService', () => {
  const service = new MatchingService();
  const fertilizer = {
    id: 'fertilizer-id',
    name: 'NPK Fertilizer',
    category: 'fertilizer',
    unit: 'kg',
    pricingTiers: [
      { region: 'default', minQuantity: 0, maxQuantity: 50, pricePerUnit: 20 },
      { region: 'default', minQuantity: 50, maxQuantity: 100, pricePerUnit: 18 },
      { region: 'KwaZulu-Natal', minQuantity: 50, maxQuantity: 100, pricePerUnit: 17 },
    ],
  } as Product;

  const makeDealer = (overrides: Partial<Dealer>): Dealer =>
    ({
      id: 'dealer-id',
      name: 'Dealer',
      region: 'KwaZulu-Natal',
      address: 'Farm road',
      latitude: -29.2,
      longitude: 30.0,
      fulfillmentPerformance: 80,
      inventory: [
        {
          id: 'inventory-id',
          product: fertilizer,
          quantityAvailable: 100,
          stockFreshnessDays: 5,
          priceAdjustmentPercent: 0,
        },
      ] as Dealer['inventory'],
      ...overrides,
    }) as Dealer;

  it('calculates regional tier pricing for the requested quantity', () => {
    expect(service.calculateUnitPrice(fertilizer, 50, 'Gauteng')).toBe(18);
    expect(service.calculateUnitPrice(fertilizer, 80, 'KwaZulu-Natal')).toBe(17);
    expect(service.calculateUnitPrice(fertilizer, 80, 'Gauteng')).toBe(18);
  });

  it('matches the lowest priced qualified dealer before distance', () => {
    const nearbyExpensive = makeDealer({
      id: 'nearby',
      name: 'Nearby Expensive',
      latitude: -29.21,
      longitude: 30.01,
      inventory: [
        {
          id: 'nearby-stock',
          product: fertilizer,
          quantityAvailable: 100,
          stockFreshnessDays: 4,
          priceAdjustmentPercent: 10,
        },
      ] as Dealer['inventory'],
    });
    const fartherCheaper = makeDealer({
      id: 'farther',
      name: 'Farther Cheaper',
      latitude: -29.7,
      longitude: 30.5,
      inventory: [
        {
          id: 'farther-stock',
          product: fertilizer,
          quantityAvailable: 100,
          stockFreshnessDays: 4,
          priceAdjustmentPercent: -5,
        },
      ] as Dealer['inventory'],
    });

    const match = service.matchDealer(
      [nearbyExpensive, fartherCheaper],
      [{ productId: fertilizer.id, quantity: 80 }],
      { latitude: -29.22, longitude: 30.02, region: 'KwaZulu-Natal' },
    );

    expect(match?.dealer.id).toBe('farther');
    expect(match?.totalCost).toBe(1292);
  });

  it('creates a partial backorder plan when no dealer has enough stock', () => {
    const dealerA = makeDealer({
      id: 'dealer-a',
      inventory: [{ id: 'a-stock', product: fertilizer, quantityAvailable: 40, stockFreshnessDays: 1, priceAdjustmentPercent: 0 }] as Dealer['inventory'],
    });
    const dealerB = makeDealer({
      id: 'dealer-b',
      inventory: [{ id: 'b-stock', product: fertilizer, quantityAvailable: 25, stockFreshnessDays: 1, priceAdjustmentPercent: 0 }] as Dealer['inventory'],
    });

    const plan = service.buildBackorderPlan(
      [dealerA, dealerB],
      [{ productId: fertilizer.id, quantity: 80 }],
      { latitude: -29.22, longitude: 30.02, region: 'KwaZulu-Natal' },
    );

    expect(plan.allocations).toHaveLength(2);
    expect(plan.allocations.reduce((sum, allocation) => sum + allocation.quantity, 0)).toBe(65);
    expect(plan.remaining).toEqual([{ productId: fertilizer.id, quantity: 15 }]);
  });
});
