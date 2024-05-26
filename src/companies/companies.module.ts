import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './companies.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesResolver } from './companies.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    AuthModule,
  ],
  providers: [CompaniesService, CompaniesResolver],
})
export class CompaniesModule {}
