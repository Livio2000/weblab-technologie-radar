import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.schema';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.email,
      createUserDto.password,
      createUserDto.role || UserRole.EMPLOYEE,
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
