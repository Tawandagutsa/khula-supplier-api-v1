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
exports.CreateDealerDto = exports.DealerInventoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class DealerInventoryDto {
    constructor() {
        this.stockFreshnessDays = 0;
        this.priceAdjustmentPercent = 0;
    }
}
exports.DealerInventoryDto = DealerInventoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '8bb7837d-7d51-42e8-9099-aa0b630a75d4' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DealerInventoryDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DealerInventoryDto.prototype, "quantityAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DealerInventoryDto.prototype, "stockFreshnessDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -3, description: 'Dealer-specific markup or discount applied to product tier price.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-100),
    __metadata("design:type", Number)
], DealerInventoryDto.prototype, "priceAdjustmentPercent", void 0);
class CreateDealerDto {
    constructor() {
        this.fulfillmentPerformance = 80;
    }
}
exports.CreateDealerDto = CreateDealerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mthembu Agri Supplies' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'KwaZulu-Natal' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'R103, Mooi River' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -29.209 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 29.994 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 92, default: 80 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "fulfillmentPerformance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DealerInventoryDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DealerInventoryDto),
    __metadata("design:type", Array)
], CreateDealerDto.prototype, "inventory", void 0);
//# sourceMappingURL=create-dealer.dto.js.map