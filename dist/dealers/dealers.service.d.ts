import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { Dealer } from './entities/dealer.entity';
export declare class DealersService {
    private readonly dealers;
    private readonly products;
    constructor(dealers: Repository<Dealer>, products: Repository<Product>);
    create(dto: CreateDealerDto): Promise<Dealer>;
    findAllWithInventory(): Promise<Dealer[]>;
}
