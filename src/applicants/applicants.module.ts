import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Applicant, ApplicantSchema } from './applicants.schema';
import { ApplicantsResolver } from './applicants.resolver';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
    CandidatesModule,
    JobsModule,
    CompaniesModule,
  ],
  providers: [ApplicantsService, ApplicantsResolver],
})
export class ApplicantsModule {}
