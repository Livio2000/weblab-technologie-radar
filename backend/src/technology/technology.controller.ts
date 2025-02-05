import { Controller, Get } from '@nestjs/common';
import { TechnologyService } from './technology.service';
import { Technology } from './technology.schema';

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
}
