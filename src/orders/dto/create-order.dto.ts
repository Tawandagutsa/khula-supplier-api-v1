import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: '8bb7837d-7d51-42e8-9099-aa0b630a75d4' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nomsa Dlamini' })
  @IsString()
  farmerName!: string;

  @ApiProperty({ example: 'KwaZulu-Natal' })
  @IsString()
  farmerRegion!: string;

  @ApiProperty({ example: -29.612 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  farmerLatitude!: number;

  @ApiProperty({ example: 30.383 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  farmerLongitude!: number;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
