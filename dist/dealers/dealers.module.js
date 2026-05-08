"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const dealer_inventory_entity_1 = require("./entities/dealer-inventory.entity");
const dealer_entity_1 = require("./entities/dealer.entity");
const dealers_controller_1 = require("./dealers.controller");
const dealers_service_1 = require("./dealers.service");
let DealersModule = class DealersModule {
};
exports.DealersModule = DealersModule;
exports.DealersModule = DealersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([dealer_entity_1.Dealer, dealer_inventory_entity_1.DealerInventory, product_entity_1.Product])],
        controllers: [dealers_controller_1.DealersController],
        providers: [dealers_service_1.DealersService],
        exports: [dealers_service_1.DealersService, typeorm_1.TypeOrmModule],
    })
], DealersModule);
//# sourceMappingURL=dealers.module.js.map