"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const dealers_module_1 = require("./dealers/dealers.module");
const dealer_entity_1 = require("./dealers/entities/dealer.entity");
const dealer_inventory_entity_1 = require("./dealers/entities/dealer-inventory.entity");
const orders_module_1 = require("./orders/orders.module");
const order_entity_1 = require("./orders/entities/order.entity");
const order_allocation_entity_1 = require("./orders/entities/order-allocation.entity");
const order_item_entity_1 = require("./orders/entities/order-item.entity");
const products_module_1 = require("./products/products.module");
const pricing_tier_entity_1 = require("./products/entities/pricing-tier.entity");
const product_entity_1 = require("./products/entities/product.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: config.get('DB_TYPE', 'postgres'),
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USERNAME', 'khula'),
                    password: config.get('DB_PASSWORD', 'khula'),
                    database: config.get('DB_DATABASE', 'khula_supplier_network'),
                    entities: [dealer_entity_1.Dealer, dealer_inventory_entity_1.DealerInventory, product_entity_1.Product, pricing_tier_entity_1.PricingTier, order_entity_1.Order, order_item_entity_1.OrderItem, order_allocation_entity_1.OrderAllocation],
                    synchronize: config.get('DB_SYNC', 'false') === 'true',
                }),
            }),
            dealers_module_1.DealersModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map