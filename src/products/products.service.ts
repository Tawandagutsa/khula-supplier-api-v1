import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { PricingTier } from './entities/pricing-tier.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.products.create({
      name: dto.name,
      category: dto.category,
      unit: dto.unit ?? 'kg',
      pricingTiers: dto.pricingTiers.map((tier) => ({
        region: tier.region ?? 'default',
        minQuantity: tier.minQuantity,
        maxQuantity: tier.maxQuantity ?? null,
        pricePerUnit: tier.pricePerUnit,
      }) as PricingTier),
    });

    return this.products.save(product);
  }
}
