import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { CompaniesService, CreateCompanyBody } from './companies.service';
import { CompanyModel } from './companies.model';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => CompanyModel)
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @Query(() => [CompanyModel])
  async companies(): Promise<CompanyModel[]> {
    return this.companiesService.getAll();
  }

  @Query(() => CompanyModel)
  async company(
    @Args('name', { type: () => String }) name: string,
  ): Promise<CompanyModel> {
    return this.companiesService.get(name);
  }

  @Mutation(() => CompanyModel)
  async createCompany(
    @Args('companyData') companyData: CreateCompanyBody,
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel> {
    return this.companiesService.create(ctx, companyData);
  }

  @Mutation(() => CompanyModel)
  async editCompany(
    @Args('id', { type: () => String }) id: string,
    @Args('companyData')
    companyData: CreateCompanyBody,
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel> {
    return this.companiesService.edit(ctx, id, companyData);
  }

  @Mutation(() => CompanyModel)
  async deleteCompany(
    @Args('id', { type: () => String }) id: string,
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel> {
    return this.companiesService.delete(ctx, id);
  }
}
