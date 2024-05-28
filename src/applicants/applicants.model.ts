import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApplicantStatus } from './applicants.schema';

registerEnumType(ApplicantStatus, { name: 'ApplicantStatus' });

@ObjectType()
export class ApplicantModel {
  @Field()
  id: string;
  @Field()
  job: string;
  @Field()
  user: string;
  @Field(() => ApplicantStatus)
  status: ApplicantStatus;
}

@InputType()
export class CreateApplicantBody {}
