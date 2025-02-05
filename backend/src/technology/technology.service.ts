import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technology } from './technology.schema';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Injectable()
export class TechnologyService {
  constructor(
    @InjectModel(Technology.name) private readonly technologyModel: Model<Technology>,
  ) {}

  async findAll(): Promise<Technology[]> {
    return this.technologyModel.find().exec();
  }

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    if (createTechnologyDto.published) {
      (createTechnologyDto as Technology).publishedDate = new Date();
    } else {
      (createTechnologyDto as Technology).publishedDate = null;
    }

    const newTechnology = new this.technologyModel(createTechnologyDto);
    return newTechnology.save();
  }

  async update(id: string, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology> {
    if (updateTechnologyDto.published !== undefined) {
      (updateTechnologyDto as Technology).publishedDate = updateTechnologyDto.published ? new Date() : null;
    }

    const existingTech = await this.technologyModel.findByIdAndUpdate(id, updateTechnologyDto, {
      new: true,
      runValidators: true,
    });

    if (!existingTech) {
      throw new NotFoundException(`Technology with ID "${id}" not found.`);
    }
    return existingTech;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.technologyModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Technology with ID "${id}" not found.`);
    }
    return { deleted: true };
  }
}
