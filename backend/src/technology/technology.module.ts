import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Technology, TechnologySchema } from './technology.schema';
import { TechnologyService } from './technology.service';
import { TechnologyController } from './technology.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Technology.name, schema: TechnologySchema }]),
  ],
  controllers: [TechnologyController],
  providers: [TechnologyService],
})
export class TechnologyModule {}
