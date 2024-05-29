import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserKind {
  COMPANY = 'company',
  CANDIDATE = 'candidate',
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true, enum: Object.values(UserKind) })
  kind: UserKind;
}

export const UserSchema = SchemaFactory.createForClass(User);
