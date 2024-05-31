import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Job {
  @Prop({ required: true, index: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  isOpen: boolean;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companay',
  })
  company: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({ isOpen: 1 }, { background: true });
