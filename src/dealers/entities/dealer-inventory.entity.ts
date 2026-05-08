import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Dealer } from './dealer.entity';

@Entity('dealer_inventory')
export class DealerInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Dealer, (dealer) => dealer.inventory, { onDelete: 'CASCADE' })
  dealer!: Dealer;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product!: Product;

  @Column('decimal', { precision: 12, scale: 2 })
  quantityAvailable!: number;

  @Column('int', { default: 0 })
  stockFreshnessDays!: number;

  @Column('decimal', { precision: 6, scale: 2, default: 0 })
  priceAdjustmentPercent!: number;
}
