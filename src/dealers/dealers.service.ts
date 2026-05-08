import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { DealerInventory } from './entities/dealer-inventory.entity';
import { Dealer } from './entities/dealer.entity';

@Injectable()
export class DealersService {
  constructor(
    @InjectRepository(Dealer)
    private readonly dealers: Repository<Dealer>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async create(dto: CreateDealerDto): Promise<Dealer> {
    const productIds = dto.inventory?.map((item) => item.productId) ?? [];
    const products = productIds.length ? await this.products.findBy({ id: In(productIds) }) : [];
    const productsById = new Map(products.map((product) => [product.id, product]));

    if (productsById.size !== new Set(productIds).size) {
      throw new BadRequestException('One or more inventory products do not exist');
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
      }) as DealerInventory),
    });

    return this.dealers.save(dealer);
  }

  findAllWithInventory(): Promise<Dealer[]> {
    return this.dealers.find({ relations: { inventory: { product: { pricingTiers: true } } } });
  }
}
