import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class CandidateModel {
  @Field()
  id: string;
  @Field()
  fullname: string;
  @Field()
  nickname: string;
  @Field()
  contactInfo: string;
  @Field()
  information: string;
}

@InputType()
export class CreateCandidateData {
  @IsNotEmpty()
  @Field()
  fullname: string;
  @Field()
  nickname: string;
  @Field()
  contactInfo: string;
  @Field()
  information: string;
}
