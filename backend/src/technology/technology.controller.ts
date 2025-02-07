import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TechnologyService } from './technology.service';
import { Technology } from './technology.schema';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserRole } from '../user/user.schema';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller({
    path: 'technologies', 
    version: '1'
})
@UseGuards(AuthGuard, RolesGuard)
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async getAllTechnologies(): Promise<Technology[]> {
    return this.technologyService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createTechnology(@Body() createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    return this.technologyService.create(createTechnologyDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateTechnology(
    @Param('id') id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ): Promise<Technology> {
    return this.technologyService.update(id, updateTechnologyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteTechnology(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.technologyService.delete(id);
  }
}
