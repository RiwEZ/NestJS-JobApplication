import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './candidates.schema';
import { CandidatesService } from './candidates.service';
import { CandidatesResolver } from './candidates.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
    ]),
  ],
  providers: [CandidatesService, CandidatesResolver],
  exports: [CandidatesService],
})
export class CandidatesModule {}
