"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dealers_module_1 = require("../dealers/dealers.module");
const dealer_inventory_entity_1 = require("../dealers/entities/dealer-inventory.entity");
const matching_service_1 = require("../matching/matching.service");
const product_entity_1 = require("../products/entities/product.entity");
const order_allocation_entity_1 = require("./entities/order-allocation.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_entity_1 = require("./entities/order.entity");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [dealers_module_1.DealersModule, typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, order_item_entity_1.OrderItem, order_allocation_entity_1.OrderAllocation, product_entity_1.Product, dealer_inventory_entity_1.DealerInventory])],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService, matching_service_1.MatchingService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map