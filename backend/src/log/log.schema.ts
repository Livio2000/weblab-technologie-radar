import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Log extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: Date.now })
  logDate: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);