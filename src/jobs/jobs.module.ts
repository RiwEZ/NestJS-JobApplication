import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './jobs.schema';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    forwardRef(() => CompaniesModule),
  ],
  providers: [JobsService, JobsResolver],
  exports: [JobsService],
})
export class JobsModule {}
