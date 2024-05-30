import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { CreateJobBody, JobModel } from './jobs.model';
import { JobsService } from './jobs.service';
import { Company } from 'src/auth/auth.guard';
import { CompanyModel } from 'src/companies/companies.model';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => JobModel)
export class JobsResolver {
  constructor(private jobsService: JobsService) {}

  @Query(() => [JobModel])
  async jobs(
    @Args('isOpen', { defaultValue: true }) isOpen: boolean,
  ): Promise<JobModel[]> {
    return this.jobsService.getAll(isOpen);
  }

  @ResolveField()
  async company(@Parent() job: JobModel): Promise<CompanyModel> {
    return this.jobsService.getCompanyOf(job.id);
  }

  @Company()
  @Mutation(() => JobModel)
  async deleteJob(
    @Context() ctx: GraphQLContext,
    @Args('jobId') jobId: string,
  ) {
    return this.jobsService.delete(ctx.req.user.sub, jobId);
  }

  @Company()
  @Mutation(() => JobModel)
  async createJob(
    @Context() ctx: GraphQLContext,
    @Args('jobData') jobData: CreateJobBody,
  ): Promise<JobModel> {
    return this.jobsService.create(ctx.req.user.sub, jobData);
  }

  @Company()
  @Mutation(() => JobModel)
  async toggleJobStatus(
    @Context() ctx: GraphQLContext,
    @Args('jobId') jobId: string,
  ) {
    return this.jobsService.toggleStatus(ctx.req.user.sub, jobId);
  }
}
