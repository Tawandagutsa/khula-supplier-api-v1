import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { DealerInventory } from './entities/dealer-inventory.entity';
import { Dealer } from './entities/dealer.entity';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer, DealerInventory, Product])],
  controllers: [DealersController],
  providers: [DealersService],
  exports: [DealersService, TypeOrmModule],
})
export class DealersModule {}
