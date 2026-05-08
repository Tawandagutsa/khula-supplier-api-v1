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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dealers_service_1 = require("../dealers/dealers.service");
const dealer_inventory_entity_1 = require("../dealers/entities/dealer-inventory.entity");
const matching_service_1 = require("../matching/matching.service");
const product_entity_1 = require("../products/entities/product.entity");
const order_entity_1 = require("./entities/order.entity");
let OrdersService = class OrdersService {
    constructor(orders, products, inventory, dealersService, matchingService) {
        this.orders = orders;
        this.products = products;
        this.inventory = inventory;
        this.dealersService = dealersService;
        this.matchingService = matchingService;
    }
    async create(dto) {
        const products = await this.products.find({
            where: { id: (0, typeorm_2.In)(dto.items.map((item) => item.productId)) },
            relations: { pricingTiers: true },
        });
        const productsById = new Map(products.map((product) => [product.id, product]));
        if (productsById.size !== new Set(dto.items.map((item) => item.productId)).size) {
            throw new common_1.BadRequestException('One or more order products do not exist');
        }
        const dealers = await this.dealersService.findAllWithInventory();
        const farmer = {
            latitude: dto.farmerLatitude,
            longitude: dto.farmerLongitude,
            region: dto.farmerRegion,
        };
        const fullMatch = this.matchingService.matchDealer(dealers, dto.items, farmer);
        if (fullMatch) {
            await this.reserveAllocations(fullMatch.allocations);
            return this.orders.save(this.orders.create({
                farmerName: dto.farmerName,
                farmerRegion: dto.farmerRegion,
                farmerLatitude: dto.farmerLatitude,
                farmerLongitude: dto.farmerLongitude,
                status: order_entity_1.OrderStatus.Pending,
                assignedDealerId: fullMatch.dealer.id,
                assignedDealerName: fullMatch.dealer.name,
                totalCost: fullMatch.totalCost,
                distanceKm: fullMatch.distanceKm,
                estimatedDeliveryWindow: fullMatch.estimatedDeliveryWindow,
                items: dto.items.map((item) => ({ product: productsById.get(item.productId), quantity: item.quantity })),
                allocations: fullMatch.allocations.map((allocation) => ({
                    dealer: allocation.dealer,
                    product: allocation.product,
                    quantity: allocation.quantity,
                    unitPrice: allocation.unitPrice,
                    lineTotal: allocation.lineTotal,
                })),
                backorder: null,
            }));
        }
        const backorderPlan = this.matchingService.buildBackorderPlan(dealers, dto.items, farmer);
        await this.reserveAllocations(backorderPlan.allocations);
        return this.orders.save(this.orders.create({
            farmerName: dto.farmerName,
            farmerRegion: dto.farmerRegion,
            farmerLatitude: dto.farmerLatitude,
            farmerLongitude: dto.farmerLongitude,
            status: order_entity_1.OrderStatus.Backordered,
            assignedDealerId: null,
            assignedDealerName: null,
            totalCost: backorderPlan.totalCost,
            distanceKm: null,
            estimatedDeliveryWindow: 'pending supplier confirmation',
            items: dto.items.map((item) => ({ product: productsById.get(item.productId), quantity: item.quantity })),
            allocations: backorderPlan.allocations.map((allocation) => ({
                dealer: allocation.dealer,
                product: allocation.product,
                quantity: allocation.quantity,
                unitPrice: allocation.unitPrice,
                lineTotal: allocation.lineTotal,
            })),
            backorder: {
                remaining: backorderPlan.remaining,
                notifySuppliers: true,
            },
        }));
    }
    async findOne(id) {
        const order = await this.orders.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        return this.orders.save(order);
    }
    async reserveAllocations(allocations) {
        for (const allocation of allocations) {
            const inventory = await this.inventory.findOne({
                where: {
                    dealer: { id: allocation.dealer.id },
                    product: { id: allocation.product.id },
                },
                relations: { dealer: true, product: true },
            });
            if (!inventory || Number(inventory.quantityAvailable) < allocation.quantity) {
                throw new common_1.BadRequestException('Inventory changed before reservation could complete');
            }
            inventory.quantityAvailable = Number(inventory.quantityAvailable) - allocation.quantity;
            await this.inventory.save(inventory);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(dealer_inventory_entity_1.DealerInventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        dealers_service_1.DealersService,
        matching_service_1.MatchingService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map