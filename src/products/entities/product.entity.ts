import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PricingTier } from './pricing-tier.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ default: 'kg' })
  unit!: string;

  @OneToMany(() => PricingTier, (tier) => tier.product, { cascade: true, eager: true })
  pricingTiers!: PricingTier[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
