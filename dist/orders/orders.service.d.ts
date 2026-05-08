import { Repository } from 'typeorm';
import { DealersService } from '../dealers/dealers.service';
import { DealerInventory } from '../dealers/entities/dealer-inventory.entity';
import { MatchingService } from '../matching/matching.service';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
export declare class OrdersService {
    private readonly orders;
    private readonly products;
    private readonly inventory;
    private readonly dealersService;
    private readonly matchingService;
    constructor(orders: Repository<Order>, products: Repository<Product>, inventory: Repository<DealerInventory>, dealersService: DealersService, matchingService: MatchingService);
    create(dto: CreateOrderDto): Promise<Order>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    private reserveAllocations;
}
