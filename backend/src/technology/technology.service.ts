import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technology } from './technology.schema';

@Injectable()
export class TechnologyService {
  constructor(
    @InjectModel(Technology.name) private readonly technologyModel: Model<Technology>,
  ) {}

  async findAll(): Promise<Technology[]> {
    return this.technologyModel.find().exec();
  }
}
