import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CompanyModel } from 'src/companies/companies.model';

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
  @Field(() => CompanyModel, { nullable: true })
  company?: CompanyModel;
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
