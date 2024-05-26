import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CompaniesService, CreateCompanyBody } from './companies.service';
import { CompanyModel } from './companies.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver((of) => CompanyModel)
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @UseGuards(AuthGuard)
  @Query((returns) => [CompanyModel])
  async companies(): Promise<CompanyModel[]> {
    return this.companiesService.getAll();
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CompanyModel)
  async createCompany(
    @Args('companyData') companyData: CreateCompanyBody,
  ): Promise<CompanyModel> {
    const result = await this.companiesService.create(companyData);
    return result;
  }
}
