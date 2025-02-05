import { IsEnum, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { TechnologyCategory, TechnologyRing } from '../technology.schema';

export class CreateTechnologyDto {
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
  published: boolean;
}
