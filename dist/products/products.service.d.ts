import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
export declare class ProductsService {
    private readonly products;
    constructor(products: Repository<Product>);
    create(dto: CreateProductDto): Promise<Product>;
}
