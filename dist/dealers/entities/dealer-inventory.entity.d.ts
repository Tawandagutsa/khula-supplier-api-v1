import { Product } from '../../products/entities/product.entity';
import { Dealer } from './dealer.entity';
export declare class DealerInventory {
    id: string;
    dealer: Dealer;
    product: Product;
    quantityAvailable: number;
    stockFreshnessDays: number;
    priceAdjustmentPercent: number;
}
