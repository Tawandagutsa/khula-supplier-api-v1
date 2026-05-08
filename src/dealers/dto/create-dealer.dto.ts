import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class DealerInventoryDto {
  @ApiProperty({ example: '8bb7837d-7d51-42e8-9099-aa0b630a75d4' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  quantityAvailable!: number;

  @ApiProperty({ example: 7, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockFreshnessDays?: number = 0;

  @ApiProperty({ example: -3, description: 'Dealer-specific markup or discount applied to product tier price.' })
  @IsOptional()
  @IsNumber()
  @Min(-100)
  priceAdjustmentPercent?: number = 0;
}

export class CreateDealerDto {
  @ApiProperty({ example: 'Mthembu Agri Supplies' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'KwaZulu-Natal' })
  @IsString()
  region!: string;

  @ApiProperty({ example: 'R103, Mooi River' })
  @IsString()
  address!: string;

  @ApiProperty({ example: -29.209 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 29.994 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ example: 92, default: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fulfillmentPerformance?: number = 80;

  @ApiProperty({ type: [DealerInventoryDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DealerInventoryDto)
  inventory?: DealerInventoryDto[];
}
