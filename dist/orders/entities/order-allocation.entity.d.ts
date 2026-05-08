import { Dealer } from '../../dealers/entities/dealer.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';
export declare class OrderAllocation {
    id: string;
    order: Order;
    dealer: Dealer;
    product: Product;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
