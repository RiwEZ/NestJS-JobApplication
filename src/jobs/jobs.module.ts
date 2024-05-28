import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './jobs.schema';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    CompaniesModule,
  ],
  providers: [JobsService, JobsResolver],
})
export class JobsModule {}
