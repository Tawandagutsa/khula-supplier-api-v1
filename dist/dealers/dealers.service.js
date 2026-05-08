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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const dealer_entity_1 = require("./entities/dealer.entity");
let DealersService = class DealersService {
    constructor(dealers, products) {
        this.dealers = dealers;
        this.products = products;
    }
    async create(dto) {
        const productIds = dto.inventory?.map((item) => item.productId) ?? [];
        const products = productIds.length ? await this.products.findBy({ id: (0, typeorm_2.In)(productIds) }) : [];
        const productsById = new Map(products.map((product) => [product.id, product]));
        if (productsById.size !== new Set(productIds).size) {
            throw new common_1.BadRequestException('One or more inventory products do not exist');
        }
        const dealer = this.dealers.create({
            name: dto.name,
            region: dto.region,
            address: dto.address,
            latitude: dto.latitude,
            longitude: dto.longitude,
            fulfillmentPerformance: dto.fulfillmentPerformance ?? 80,
            inventory: dto.inventory?.map((item) => ({
                product: productsById.get(item.productId),
                quantityAvailable: item.quantityAvailable,
                stockFreshnessDays: item.stockFreshnessDays ?? 0,
                priceAdjustmentPercent: item.priceAdjustmentPercent ?? 0,
            })),
        });
        return this.dealers.save(dealer);
    }
    findAllWithInventory() {
        return this.dealers.find({ relations: { inventory: { product: { pricingTiers: true } } } });
    }
};
exports.DealersService = DealersService;
exports.DealersService = DealersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_entity_1.Dealer)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DealersService);
//# sourceMappingURL=dealers.service.js.map