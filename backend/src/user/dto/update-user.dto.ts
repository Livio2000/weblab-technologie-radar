import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../user.schema';

export class UpdateUserDto {
    @IsOptional()
    firstName?: string;
  
    @IsOptional()
    lastName?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @MinLength(6)
    password?: string;
  
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
  }
  