import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DealerInventory } from './dealer-inventory.entity';

@Entity('dealers')
export class Dealer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  region!: string;

  @Column()
  address!: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 80 })
  fulfillmentPerformance!: number;

  @OneToMany(() => DealerInventory, (inventory) => inventory.dealer, { cascade: true, eager: true })
  inventory!: DealerInventory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
