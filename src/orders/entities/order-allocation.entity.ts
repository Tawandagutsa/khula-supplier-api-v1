import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dealer } from '../../dealers/entities/dealer.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_allocations')
export class OrderAllocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.allocations, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Dealer, { eager: true })
  dealer!: Dealer;

  @ManyToOne(() => Product, { eager: true })
  product!: Product;

  @Column('decimal', { precision: 12, scale: 2 })
  quantity!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  lineTotal!: number;
}
