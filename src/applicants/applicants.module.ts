import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Applicant, ApplicantSchema } from './applicants.schema';
import { ApplicantsResolver } from './applicants.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
  ],
  providers: [ApplicantsService, ApplicantsResolver],
})
export class ApplicantsModule {}
