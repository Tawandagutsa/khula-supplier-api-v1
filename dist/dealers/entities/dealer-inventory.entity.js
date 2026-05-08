"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerInventory = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const dealer_entity_1 = require("./dealer.entity");
let DealerInventory = class DealerInventory {
};
exports.DealerInventory = DealerInventory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealerInventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealer_entity_1.Dealer, (dealer) => dealer.inventory, { onDelete: 'CASCADE' }),
    __metadata("design:type", dealer_entity_1.Dealer)
], DealerInventory.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", product_entity_1.Product)
], DealerInventory.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DealerInventory.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], DealerInventory.prototype, "stockFreshnessDays", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerInventory.prototype, "priceAdjustmentPercent", void 0);
exports.DealerInventory = DealerInventory = __decorate([
    (0, typeorm_1.Entity)('dealer_inventory')
], DealerInventory);
//# sourceMappingURL=dealer-inventory.entity.js.map