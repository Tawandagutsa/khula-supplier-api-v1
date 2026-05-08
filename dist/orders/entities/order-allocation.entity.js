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
exports.OrderAllocation = void 0;
const typeorm_1 = require("typeorm");
const dealer_entity_1 = require("../../dealers/entities/dealer.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const order_entity_1 = require("./order.entity");
let OrderAllocation = class OrderAllocation {
};
exports.OrderAllocation = OrderAllocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderAllocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.allocations, { onDelete: 'CASCADE' }),
    __metadata("design:type", order_entity_1.Order)
], OrderAllocation.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealer_entity_1.Dealer, { eager: true }),
    __metadata("design:type", dealer_entity_1.Dealer)
], OrderAllocation.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { eager: true }),
    __metadata("design:type", product_entity_1.Product)
], OrderAllocation.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], OrderAllocation.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], OrderAllocation.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], OrderAllocation.prototype, "lineTotal", void 0);
exports.OrderAllocation = OrderAllocation = __decorate([
    (0, typeorm_1.Entity)('order_allocations')
], OrderAllocation);
//# sourceMappingURL=order-allocation.entity.js.map