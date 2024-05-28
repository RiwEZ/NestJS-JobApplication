import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './companies.schema';
import { CompaniesResolver } from './companies.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  providers: [CompaniesService, CompaniesResolver],
  exports: [CompaniesService],
})
export class CompaniesModule {}
