import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class CompanyModel {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field()
  description: string;
  @Field()
  contactInfo: string;
}

@InputType()
export class CreateCompanyData {
  @Field()
  @IsNotEmpty()
  name: string;
  @Field()
  description: string;
  @Field()
  contactInfo: string;
}
