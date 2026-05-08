import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("./entities/order.entity").Order>;
}
