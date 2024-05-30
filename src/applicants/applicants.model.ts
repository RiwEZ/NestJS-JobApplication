import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApplicantStatus } from './applicants.schema';
import { CandidateModel } from 'src/candidates/candidates.model';

registerEnumType(ApplicantStatus, { name: 'ApplicantStatus' });

@ObjectType()
export class ApplicantModel {
  @Field()
  id: string;
  @Field()
  job: string;
  @Field(() => CandidateModel, { nullable: true })
  candidate?: CandidateModel;
  @Field(() => ApplicantStatus)
  status: ApplicantStatus;
}

@InputType()
export class CreateApplicantBody {}
