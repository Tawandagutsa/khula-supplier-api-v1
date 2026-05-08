import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('pricing_tiers')
export class PricingTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 'default' })
  region!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  minQuantity!: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  maxQuantity!: number | null;

  @Column('decimal', { precision: 12, scale: 2 })
  pricePerUnit!: number;

  @ManyToOne(() => Product, (product) => product.pricingTiers, { onDelete: 'CASCADE' })
  product!: Product;
}
