import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TechnologyService } from './technology.service';
import { Technology } from './technology.schema';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Controller({
    path: 'technologies', 
    version: '1'
})
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Get()
  async getAllTechnologies(): Promise<Technology[]> {
    return this.technologyService.findAll();
  }

  @Post()
  async createTechnology(@Body() createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    return this.technologyService.create(createTechnologyDto);
  }

  @Put(':id')
  async updateTechnology(
    @Param('id') id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ): Promise<Technology> {
    return this.technologyService.update(id, updateTechnologyDto);
  }

  @Delete(':id')
  async deleteTechnology(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.technologyService.delete(id);
  }
}
