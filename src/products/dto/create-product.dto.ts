import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

export class CreatePricingTierDto {
  @ApiProperty({ example: 'KwaZulu-Natal', default: 'default' })
  @IsOptional()
  @IsString()
  region?: string = 'default';

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  minQuantity!: number;

  @ApiProperty({ example: 50, nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxQuantity?: number | null;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  pricePerUnit!: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'NPK Fertilizer' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'fertilizer' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'kg', default: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string = 'kg';

  @ApiProperty({ type: [CreatePricingTierDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePricingTierDto)
  pricingTiers!: CreatePricingTierDto[];
}
