import { CreateDealerDto } from './dto/create-dealer.dto';
import { DealersService } from './dealers.service';
export declare class DealersController {
    private readonly dealersService;
    constructor(dealersService: DealersService);
    create(dto: CreateDealerDto): Promise<import("./entities/dealer.entity").Dealer>;
}
