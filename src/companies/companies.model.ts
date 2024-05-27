import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyModel {
  @Field()
  id: string;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  description: string;
  @Field({ nullable: true })
  contactInfo: string;
}

@ObjectType()
export class MutationStatus {
  @Field()
  message: string;
}
