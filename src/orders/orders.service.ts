import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DealersService } from '../dealers/dealers.service';
import { DealerInventory } from '../dealers/entities/dealer-inventory.entity';
import { MatchingService } from '../matching/matching.service';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderAllocation } from './entities/order-allocation.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(DealerInventory)
    private readonly inventory: Repository<DealerInventory>,
    private readonly dealersService: DealersService,
    private readonly matchingService: MatchingService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const products = await this.products.find({
      where: { id: In(dto.items.map((item) => item.productId)) },
      relations: { pricingTiers: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    if (productsById.size !== new Set(dto.items.map((item) => item.productId)).size) {
      throw new BadRequestException('One or more order products do not exist');
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
      return this.orders.save(
        this.orders.create({
          farmerName: dto.farmerName,
          farmerRegion: dto.farmerRegion,
          farmerLatitude: dto.farmerLatitude,
          farmerLongitude: dto.farmerLongitude,
          status: OrderStatus.Pending,
          assignedDealerId: fullMatch.dealer.id,
          assignedDealerName: fullMatch.dealer.name,
          totalCost: fullMatch.totalCost,
          distanceKm: fullMatch.distanceKm,
          estimatedDeliveryWindow: fullMatch.estimatedDeliveryWindow,
          items: dto.items.map((item) => ({ product: productsById.get(item.productId), quantity: item.quantity }) as OrderItem),
          allocations: fullMatch.allocations.map((allocation) => ({
            dealer: allocation.dealer,
            product: allocation.product,
            quantity: allocation.quantity,
            unitPrice: allocation.unitPrice,
            lineTotal: allocation.lineTotal,
          }) as OrderAllocation),
          backorder: null,
        }),
      );
    }

    const backorderPlan = this.matchingService.buildBackorderPlan(dealers, dto.items, farmer);
    await this.reserveAllocations(backorderPlan.allocations);

    return this.orders.save(
      this.orders.create({
        farmerName: dto.farmerName,
        farmerRegion: dto.farmerRegion,
        farmerLatitude: dto.farmerLatitude,
        farmerLongitude: dto.farmerLongitude,
        status: OrderStatus.Backordered,
        assignedDealerId: null,
        assignedDealerName: null,
        totalCost: backorderPlan.totalCost,
        distanceKm: null,
        estimatedDeliveryWindow: 'pending supplier confirmation',
        items: dto.items.map((item) => ({ product: productsById.get(item.productId), quantity: item.quantity }) as OrderItem),
        allocations: backorderPlan.allocations.map((allocation) => ({
          dealer: allocation.dealer,
          product: allocation.product,
          quantity: allocation.quantity,
          unitPrice: allocation.unitPrice,
          lineTotal: allocation.lineTotal,
        }) as OrderAllocation),
        backorder: {
          remaining: backorderPlan.remaining,
          notifySuppliers: true,
        },
      }),
    );
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orders.save(order);
  }

  private async reserveAllocations(allocations: Array<{ dealer: { id: string }; product: { id: string }; quantity: number }>): Promise<void> {
    for (const allocation of allocations) {
      const inventory = await this.inventory.findOne({
        where: {
          dealer: { id: allocation.dealer.id },
          product: { id: allocation.product.id },
        },
        relations: { dealer: true, product: true },
      });

      if (!inventory || Number(inventory.quantityAvailable) < allocation.quantity) {
        throw new BadRequestException('Inventory changed before reservation could complete');
      }

      inventory.quantityAvailable = Number(inventory.quantityAvailable) - allocation.quantity;
      await this.inventory.save(inventory);
    }
  }
}
