import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { CompanyModel, CreateCompanyData } from './companies.model';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { Company } from 'src/auth/auth.guard';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => CompanyModel)
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @Query(() => [CompanyModel])
  async companies(): Promise<CompanyModel[]> {
    return this.companiesService.getAll();
  }

  @Company()
  @Query(() => CompanyModel)
  async companyUndercare(
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel> {
    return this.companiesService.getUndercare(ctx.req.user.sub);
  }

  @Query(() => CompanyModel)
  async company(
    @Args('name', { type: () => String }) name: string,
  ): Promise<CompanyModel> {
    return this.companiesService.get(name);
  }

  @Company()
  @Mutation(() => CompanyModel)
  async registerCompany(
    @Context() ctx: GraphQLContext,
    @Args('data') data: CreateCompanyData,
  ): Promise<CompanyModel> {
    return this.companiesService.register(ctx.req.user.sub, data);
  }

  @Company()
  @Mutation(() => CompanyModel)
  async editCompany(
    @Context() ctx: GraphQLContext,
    @Args('data')
    data: CreateCompanyData,
  ): Promise<CompanyModel> {
    return this.companiesService.edit(ctx.req.user.sub, data);
  }

  @Company()
  @Mutation(() => CompanyModel)
  async deleteCompany(@Context() ctx: GraphQLContext): Promise<CompanyModel> {
    return this.companiesService.delete(ctx.req.user.sub);
  }
}
