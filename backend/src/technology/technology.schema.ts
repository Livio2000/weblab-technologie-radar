import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TechnologyCategory {
  TECHNIQUES = 'Techniques',
  TOOLS = 'Tools',
  PLATFORMS = 'Platforms',
  LANGUAGESFRAMEWORKS = 'Languages & Frameworks',
}

export enum TechnologyRing {
  ADOPT = 'Adopt',
  TRIAL = 'Trial',
  ASSESS = 'Assess',
  HOLD = 'Hold',
}

@Schema({ timestamps: true })
export class Technology extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: TechnologyCategory, required: true })
  category: TechnologyCategory;

  @Prop({ type: String, enum: TechnologyRing, required: true })
  ring: TechnologyRing;

  @Prop({ required: true })
  ringReason: string;

  @Prop({ default: false })
  published: boolean;

  @Prop({ type: Date, default: null })
  publishedDate?: Date | null;
}

export const TechnologySchema = SchemaFactory.createForClass(Technology);