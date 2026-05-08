import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { DealersService } from './dealers.service';

@ApiTags('dealers')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Post()
  create(@Body() dto: CreateDealerDto) {
    return this.dealersService.create(dto);
  }
}
