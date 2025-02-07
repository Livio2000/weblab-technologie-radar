import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './log.schema';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  async createLog(userId: string): Promise<Log> {
    const log = new this.logModel({ userId });
    return log.save();
  }

  async getAllLogs(): Promise<Log[]> {
    return this.logModel.find().exec();
  }
}