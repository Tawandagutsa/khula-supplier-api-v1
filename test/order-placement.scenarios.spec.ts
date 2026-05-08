import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { DealerInventory } from '../src/dealers/entities/dealer-inventory.entity';
import { Dealer } from '../src/dealers/entities/dealer.entity';
import { MatchingService } from '../src/matching/matching.service';
import { OrderStatus } from '../src/orders/entities/order.entity';
import { OrdersService } from '../src/orders/orders.service';
import { Product } from '../src/products/entities/product.entity';

describe('Order placement scenarios', () => {
  const resultsDir = join(__dirname, 'results');

  const saveScenarioResult = (fileName: string, order: any) => {
    mkdirSync(resultsDir, { recursive: true });
    writeFileSync(
      join(resultsDir, fileName),
      JSON.stringify(
        {
          id: order.id,
          farmerName: order.farmerName,
          farmerRegion: order.farmerRegion,
          status: order.status,
          assignedDealerId: order.assignedDealerId,
          assignedDealerName: order.assignedDealerName,
          totalCost: Number(order.totalCost),
          distanceKm: order.distanceKm === null ? null : Number(order.distanceKm),
          estimatedDeliveryWindow: order.estimatedDeliveryWindow,
          items: order.items.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: Number(item.quantity),
          })),
          allocations: order.allocations.map((allocation: any) => ({
            dealerId: allocation.dealer.id,
            dealerName: allocation.dealer.name,
            productId: allocation.product.id,
            productName: allocation.product.name,
            quantity: Number(allocation.quantity),
            unitPrice: Number(allocation.unitPrice),
            lineTotal: Number(allocation.lineTotal),
          })),
          backorder: order.backorder,
        },
        null,
        2,
      ),
    );
  };

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

  const maizeSeed = {
    id: 'maize-seed-id',
    name: 'Hybrid Maize Seed',
    category: 'seed',
    unit: 'kg',
    pricingTiers: [
      { region: 'default', minQuantity: 0, maxQuantity: 25, pricePerUnit: 65 },
      { region: 'KwaZulu-Natal', minQuantity: 25, maxQuantity: 100, pricePerUnit: 55 },
    ],
  } as Product;

  const herbicide = {
    id: 'herbicide-id',
    name: 'Broadleaf Herbicide',
    category: 'crop protection',
    unit: 'litre',
    pricingTiers: [
      { region: 'default', minQuantity: 0, maxQuantity: 20, pricePerUnit: 120 },
      { region: 'default', minQuantity: 20, maxQuantity: null, pricePerUnit: 108 },
    ],
  } as Product;

  const makeStock = (
    dealer: Dealer,
    product: Product,
    quantityAvailable: number,
    priceAdjustmentPercent = 0,
    stockFreshnessDays = 5,
  ): DealerInventory =>
    ({
      id: `${dealer.id}-${product.id}`,
      dealer,
      product,
      quantityAvailable,
      priceAdjustmentPercent,
      stockFreshnessDays,
    }) as DealerInventory;

  const makeDealer = (overrides: Partial<Dealer>): Dealer =>
    ({
      id: 'dealer-id',
      name: 'Dealer',
      region: 'KwaZulu-Natal',
      address: 'Farm road',
      latitude: -29.2,
      longitude: 30.0,
      fulfillmentPerformance: 80,
      inventory: [],
      ...overrides,
    }) as Dealer;

  const buildService = (products: Product[], dealers: Dealer[]) => {
    const inventoryByKey = new Map<string, DealerInventory>();
    for (const dealer of dealers) {
      for (const stock of dealer.inventory) {
        inventoryByKey.set(`${dealer.id}:${stock.product.id}`, stock);
      }
    }

    const ordersRepository = {
      create: jest.fn((order) => order),
      save: jest.fn(async (order) => ({ id: order.id ?? 'saved-order-id', ...order })),
      findOne: jest.fn(),
    } as unknown as Repository<any>;

    const productsRepository = {
      find: jest.fn(async () => products),
    } as unknown as Repository<Product>;

    const inventoryRepository = {
      findOne: jest.fn(async ({ where }) => inventoryByKey.get(`${where.dealer.id}:${where.product.id}`) ?? null),
      save: jest.fn(async (inventory) => inventory),
    } as unknown as Repository<DealerInventory>;

    const dealersService = {
      findAllWithInventory: jest.fn(async () => dealers),
    };

    const service = new OrdersService(
      ordersRepository,
      productsRepository,
      inventoryRepository,
      dealersService as any,
      new MatchingService(),
    );

    return { service, inventoryByKey };
  };

  it('places an 80kg fertilizer order, assigns the best dealer, calculates delivery, and reserves stock', async () => {
    const nearbyExpensive = makeDealer({
      id: 'green-valley',
      name: 'Green Valley Agri Depot',
      latitude: -29.21,
      longitude: 30.01,
      fulfillmentPerformance: 96,
    });
    nearbyExpensive.inventory = [makeStock(nearbyExpensive, fertilizer, 220, 8, 4)];

    const fartherCheaper = makeDealer({
      id: 'midlands',
      name: 'Midlands Bulk Inputs',
      latitude: -29.486,
      longitude: 30.224,
      fulfillmentPerformance: 88,
    });
    fartherCheaper.inventory = [makeStock(fartherCheaper, fertilizer, 180, -5, 12)];

    const { service, inventoryByKey } = buildService([fertilizer], [nearbyExpensive, fartherCheaper]);

    const order = await service.create({
      farmerName: 'Interview Demo Farmer',
      farmerRegion: 'KwaZulu-Natal',
      farmerLatitude: -29.612,
      farmerLongitude: 30.383,
      items: [{ productId: fertilizer.id, quantity: 80 }],
    });

    expect(order.status).toBe(OrderStatus.Pending);
    expect(order.assignedDealerName).toBe('Midlands Bulk Inputs');
    expect(order.totalCost).toBe(1292);
    expect(order.estimatedDeliveryWindow).toBe('same day');
    expect(order.allocations).toHaveLength(1);
    expect(inventoryByKey.get('midlands:fertilizer-id')?.quantityAvailable).toBe(100);

    saveScenarioResult('full-fulfillment-order.response.json', order);
  });

  it('places a multi-item order only with a dealer that can fulfill the full basket', async () => {
    const fertilizerOnly = makeDealer({
      id: 'fertilizer-only',
      name: 'Fertilizer Only Dealer',
      latitude: -29.21,
      longitude: 30.01,
      fulfillmentPerformance: 95,
    });
    fertilizerOnly.inventory = [makeStock(fertilizerOnly, fertilizer, 200, -10)];

    const basketDealer = makeDealer({
      id: 'basket-dealer',
      name: 'Basket Dealer',
      latitude: -29.486,
      longitude: 30.224,
      fulfillmentPerformance: 88,
    });
    basketDealer.inventory = [
      makeStock(basketDealer, fertilizer, 180, -5),
      makeStock(basketDealer, maizeSeed, 40, 0),
    ];

    const { service, inventoryByKey } = buildService([fertilizer, maizeSeed], [fertilizerOnly, basketDealer]);

    const order = await service.create({
      farmerName: 'Multi Item Farmer',
      farmerRegion: 'KwaZulu-Natal',
      farmerLatitude: -29.23,
      farmerLongitude: 30.02,
      items: [
        { productId: fertilizer.id, quantity: 30 },
        { productId: maizeSeed.id, quantity: 20 },
      ],
    });

    expect(order.status).toBe(OrderStatus.Pending);
    expect(order.assignedDealerName).toBe('Basket Dealer');
    expect(order.allocations).toHaveLength(2);
    expect(order.totalCost).toBe(1870);
    expect(inventoryByKey.get('basket-dealer:fertilizer-id')?.quantityAvailable).toBe(150);
    expect(inventoryByKey.get('basket-dealer:maize-seed-id')?.quantityAvailable).toBe(20);

    saveScenarioResult('multi-item-order.response.json', order);
  });

  it('creates a backorder with partial allocations when no dealer can fully fulfill the order', async () => {
    const dealerA = makeDealer({
      id: 'green-valley',
      name: 'Green Valley Agri Depot',
      latitude: -29.21,
      longitude: 30.01,
    });
    dealerA.inventory = [makeStock(dealerA, herbicide, 30, 2)];

    const dealerB = makeDealer({
      id: 'umzimkhulu',
      name: 'Umzimkhulu Farmer Co-op',
      latitude: -30.259,
      longitude: 29.936,
    });
    dealerB.inventory = [makeStock(dealerB, herbicide, 12, -4)];

    const { service, inventoryByKey } = buildService([herbicide], [dealerA, dealerB]);

    const order = await service.create({
      farmerName: 'Backorder Farmer',
      farmerRegion: 'KwaZulu-Natal',
      farmerLatitude: -30.21,
      farmerLongitude: 29.98,
      items: [{ productId: herbicide.id, quantity: 60 }],
    });

    expect(order.status).toBe(OrderStatus.Backordered);
    expect(order.assignedDealerName).toBeNull();
    expect(order.estimatedDeliveryWindow).toBe('pending supplier confirmation');
    expect(order.allocations).toHaveLength(2);
    expect(order.allocations.reduce((sum, allocation) => sum + allocation.quantity, 0)).toBe(42);
    expect(order.backorder).toEqual({
      remaining: [{ productId: herbicide.id, quantity: 18 }],
      notifySuppliers: true,
    });
    expect(inventoryByKey.get('green-valley:herbicide-id')?.quantityAvailable).toBe(0);
    expect(inventoryByKey.get('umzimkhulu:herbicide-id')?.quantityAvailable).toBe(0);

    saveScenarioResult('backordered-order.response.json', order);
  });
});
