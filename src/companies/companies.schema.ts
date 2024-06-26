import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

@Schema()
export class Company {
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  owner: User;
  @Prop({ required: true, unique: true, minlength: 1 })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  contactInfo: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
