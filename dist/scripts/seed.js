"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const app_module_1 = require("../src/app.module");
const dealers_service_1 = require("../src/dealers/dealers.service");
const orders_service_1 = require("../src/orders/orders.service");
const order_entity_1 = require("../src/orders/entities/order.entity");
const products_service_1 = require("../src/products/products.service");
async function clearDatabase(dataSource) {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE order_allocations');
    await dataSource.query('TRUNCATE TABLE order_items');
    await dataSource.query('TRUNCATE TABLE orders');
    await dataSource.query('TRUNCATE TABLE dealer_inventory');
    await dataSource.query('TRUNCATE TABLE pricing_tiers');
    await dataSource.query('TRUNCATE TABLE dealers');
    await dataSource.query('TRUNCATE TABLE products');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
}
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        const productsService = app.get(products_service_1.ProductsService);
        const dealersService = app.get(dealers_service_1.DealersService);
        const ordersService = app.get(orders_service_1.OrdersService);
        await clearDatabase(dataSource);
        const fertilizer = await productsService.create({
            name: 'NPK Fertilizer',
            category: 'fertilizer',
            unit: 'kg',
            pricingTiers: [
                { region: 'default', minQuantity: 0, maxQuantity: 50, pricePerUnit: 20 },
                { region: 'default', minQuantity: 50, maxQuantity: 100, pricePerUnit: 18 },
                { region: 'default', minQuantity: 100, maxQuantity: null, pricePerUnit: 16.5 },
                { region: 'KwaZulu-Natal', minQuantity: 50, maxQuantity: 100, pricePerUnit: 17 },
                { region: 'KwaZulu-Natal', minQuantity: 100, maxQuantity: null, pricePerUnit: 15.75 },
            ],
        });
        const maizeSeed = await productsService.create({
            name: 'Hybrid Maize Seed',
            category: 'seed',
            unit: 'kg',
            pricingTiers: [
                { region: 'default', minQuantity: 0, maxQuantity: 25, pricePerUnit: 65 },
                { region: 'default', minQuantity: 25, maxQuantity: 100, pricePerUnit: 58 },
                { region: 'KwaZulu-Natal', minQuantity: 25, maxQuantity: 100, pricePerUnit: 55 },
            ],
        });
        const herbicide = await productsService.create({
            name: 'Broadleaf Herbicide',
            category: 'crop protection',
            unit: 'litre',
            pricingTiers: [
                { region: 'default', minQuantity: 0, maxQuantity: 20, pricePerUnit: 120 },
                { region: 'default', minQuantity: 20, maxQuantity: null, pricePerUnit: 108 },
            ],
        });
        await dealersService.create({
            name: 'Green Valley Agri Depot',
            region: 'KwaZulu-Natal',
            address: 'R103, Mooi River',
            latitude: -29.209,
            longitude: 29.994,
            fulfillmentPerformance: 96,
            inventory: [
                { productId: fertilizer.id, quantityAvailable: 220, stockFreshnessDays: 4, priceAdjustmentPercent: 8 },
                { productId: maizeSeed.id, quantityAvailable: 90, stockFreshnessDays: 8, priceAdjustmentPercent: 0 },
                { productId: herbicide.id, quantityAvailable: 30, stockFreshnessDays: 15, priceAdjustmentPercent: 2 },
            ],
        });
        await dealersService.create({
            name: 'Midlands Bulk Inputs',
            region: 'KwaZulu-Natal',
            address: 'Old Main Road, Howick',
            latitude: -29.486,
            longitude: 30.224,
            fulfillmentPerformance: 88,
            inventory: [
                { productId: fertilizer.id, quantityAvailable: 180, stockFreshnessDays: 12, priceAdjustmentPercent: -5 },
                { productId: maizeSeed.id, quantityAvailable: 40, stockFreshnessDays: 6, priceAdjustmentPercent: 4 },
            ],
        });
        await dealersService.create({
            name: 'Umzimkhulu Farmer Co-op',
            region: 'KwaZulu-Natal',
            address: 'Main Street, Umzimkhulu',
            latitude: -30.259,
            longitude: 29.936,
            fulfillmentPerformance: 91,
            inventory: [
                { productId: fertilizer.id, quantityAvailable: 45, stockFreshnessDays: 2, priceAdjustmentPercent: -8 },
                { productId: herbicide.id, quantityAvailable: 12, stockFreshnessDays: 3, priceAdjustmentPercent: -4 },
            ],
        });
        await dealersService.create({
            name: 'North Ridge Farm Supply',
            region: 'Gauteng',
            address: 'Pretoria East',
            latitude: -25.747,
            longitude: 28.229,
            fulfillmentPerformance: 76,
            inventory: [
                { productId: fertilizer.id, quantityAvailable: 25, stockFreshnessDays: 20, priceAdjustmentPercent: -12 },
                { productId: maizeSeed.id, quantityAvailable: 15, stockFreshnessDays: 18, priceAdjustmentPercent: -6 },
            ],
        });
        const fullOrder = await ordersService.create({
            farmerName: 'Nomsa Dlamini',
            farmerRegion: 'KwaZulu-Natal',
            farmerLatitude: -29.612,
            farmerLongitude: 30.383,
            items: [{ productId: fertilizer.id, quantity: 80 }],
        });
        const multiItemOrder = await ordersService.create({
            farmerName: 'Sibusiso Khumalo',
            farmerRegion: 'KwaZulu-Natal',
            farmerLatitude: -29.23,
            farmerLongitude: 30.02,
            items: [
                { productId: fertilizer.id, quantity: 30 },
                { productId: maizeSeed.id, quantity: 20 },
            ],
        });
        const backorder = await ordersService.create({
            farmerName: 'Thandi Mokoena',
            farmerRegion: 'KwaZulu-Natal',
            farmerLatitude: -30.21,
            farmerLongitude: 29.98,
            items: [{ productId: herbicide.id, quantity: 60 }],
        });
        await ordersService.updateStatus(multiItemOrder.id, order_entity_1.OrderStatus.InTransit);
        console.log('Seed complete.');
        console.table([
            { label: 'Fertilizer product', id: fertilizer.id },
            { label: 'Maize seed product', id: maizeSeed.id },
            { label: 'Herbicide product', id: herbicide.id },
            { label: 'Full matched order', id: fullOrder.id, status: fullOrder.status, dealer: fullOrder.assignedDealerName, total: fullOrder.totalCost },
            { label: 'Multi-item order', id: multiItemOrder.id, status: order_entity_1.OrderStatus.InTransit, dealer: multiItemOrder.assignedDealerName, total: multiItemOrder.totalCost },
            { label: 'Backordered order', id: backorder.id, status: backorder.status, dealer: backorder.assignedDealerName ?? 'partial allocations', total: backorder.totalCost },
        ]);
    }
    finally {
        await app.close();
    }
}
seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed.js.map