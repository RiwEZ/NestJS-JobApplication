import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JobModel {
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
  description: string;
  @Field()
  isOpen: boolean;
}

@InputType()
export class CreateJobBody {
  @Field()
  title: string;
  @Field()
  description: string;
  @Field()
  isOpen: boolean;
}
