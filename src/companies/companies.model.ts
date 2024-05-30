import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { JobModel } from 'src/jobs/jobs.model';

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
  @Field(() => [JobModel], { nullable: true })
  jobs?: JobModel[];
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
