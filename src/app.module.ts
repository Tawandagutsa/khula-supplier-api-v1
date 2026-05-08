import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealersModule } from './dealers/dealers.module';
import { Dealer } from './dealers/entities/dealer.entity';
import { DealerInventory } from './dealers/entities/dealer-inventory.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderAllocation } from './orders/entities/order-allocation.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { ProductsModule } from './products/products.module';
import { PricingTier } from './products/entities/pricing-tier.entity';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'postgres' | 'mysql'>('DB_TYPE', 'postgres'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'khula'),
        password: config.get<string>('DB_PASSWORD', 'khula'),
        database: config.get<string>('DB_DATABASE', 'khula_supplier_network'),
        entities: [Dealer, DealerInventory, Product, PricingTier, Order, OrderItem, OrderAllocation],
        synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
      }),
    }),
    DealersModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
