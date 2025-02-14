import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { TechnologyCategory, TechnologyRing } from '../technology.schema';

export class UpdateTechnologyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TechnologyCategory)
  category: TechnologyCategory;

  @IsEnum(TechnologyRing)
  ring: TechnologyRing;

  @IsString()
  @IsNotEmpty()
  ringReason: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}