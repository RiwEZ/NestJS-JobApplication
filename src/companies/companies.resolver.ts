import {
  Args,
  Mutation,
  Resolver,
  Query,
  Context,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { CompanyModel, CreateCompanyData } from './companies.model';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { Company } from 'src/auth/auth.guard';
import { JobModel } from 'src/jobs/jobs.model';
import { JobsService } from 'src/jobs/jobs.service';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => CompanyModel)
export class CompaniesResolver {
  constructor(
    private companiesService: CompaniesService,
    private jobsService: JobsService,
  ) {}

  @ResolveField(() => [JobModel])
  async jobs(@Parent() company: CompanyModel): Promise<JobModel[]> {
    return this.jobsService.getJobsOf(company.id);
  }

  @Query(() => [CompanyModel])
  async companies(): Promise<CompanyModel[]> {
    return this.companiesService.getAll();
  }

  @Query(() => CompanyModel)
  async company(
    @Args('name', { type: () => String }) name: string,
  ): Promise<CompanyModel> {
    return this.companiesService.getByName(name);
  }

  @Company()
  @Query(() => CompanyModel)
  async companyUndercare(
    @Context() ctx: GraphQLContext,
  ): Promise<CompanyModel> {
    return this.companiesService.getUndercare(ctx.req.user.sub);
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
