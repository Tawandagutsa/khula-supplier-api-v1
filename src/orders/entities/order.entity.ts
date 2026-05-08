import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderAllocation } from './order-allocation.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'PENDING',
  Backordered = 'BACKORDERED',
  Confirmed = 'CONFIRMED',
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  farmerName!: string;

  @Column()
  farmerRegion!: string;

  @Column('decimal', { precision: 10, scale: 7 })
  farmerLatitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  farmerLongitude!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  status!: OrderStatus;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalCost!: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  assignedDealerId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedDealerName!: string | null;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  distanceKm!: number | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  estimatedDeliveryWindow!: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items!: OrderItem[];

  @OneToMany(() => OrderAllocation, (allocation) => allocation.order, { cascade: true, eager: true })
  allocations!: OrderAllocation[];

  @Column('json', { nullable: true })
  backorder!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
