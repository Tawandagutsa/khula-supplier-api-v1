import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealersModule } from '../dealers/dealers.module';
import { DealerInventory } from '../dealers/entities/dealer-inventory.entity';
import { MatchingService } from '../matching/matching.service';
import { Product } from '../products/entities/product.entity';
import { OrderAllocation } from './entities/order-allocation.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [DealersModule, TypeOrmModule.forFeature([Order, OrderItem, OrderAllocation, Product, DealerInventory])],
  controllers: [OrdersController],
  providers: [OrdersService, MatchingService],
})
export class OrdersModule {}
