import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TechnologyCategory, TechnologyRing } from '../technology.schema';

export class UpdateTechnologyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TechnologyCategory)
  @IsOptional()
  category?: TechnologyCategory;

  @IsEnum(TechnologyRing)
  @IsOptional()
  ring?: TechnologyRing;

  @IsString()
  @IsOptional()
  ringReason?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}