import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

@Schema()
export class Candidate {
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  owner: User;

  @Prop({ required: true, minlength: 1 })
  fullname: string;
  @Prop({ required: true, minlength: 1 })
  nickname: string;
  @Prop({ required: true })
  contactInfo: string;
  @Prop({ required: true })
  information: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
