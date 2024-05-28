import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { CompanyModel, CreateCompanyBody } from './companies.model';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => CompanyModel)
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @Query(() => [CompanyModel])
  async companiesUndercare(
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel[]> {
    return this.companiesService.getAllUndercare(ctx);
  }

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
    @Context() ctx: GraphQLContext,
    @Args('companyData') companyData: CreateCompanyBody,
  ): Promise<CompanyModel> {
    return this.companiesService.create(ctx, companyData);
  }

  @Mutation(() => CompanyModel)
  async editCompany(
    @Context() ctx: GraphQLContext,
    @Args('id', { type: () => String }) id: string,
    @Args('companyData')
    companyData: CreateCompanyBody,
  ): Promise<CompanyModel> {
    return this.companiesService.edit(ctx, id, companyData);
  }

  @Mutation(() => CompanyModel)
  async deleteCompany(
    @Context() ctx: GraphQLContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<CompanyModel> {
    return this.companiesService.delete(ctx, id);
  }
}
