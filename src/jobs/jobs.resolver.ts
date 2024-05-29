import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { CreateJobBody, JobModel } from './jobs.model';
import { JobsService } from './jobs.service';
import { Company } from 'src/auth/auth.guard';

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
    @Args('companyId') companyId: string,
    @Args('jobData') jobData: CreateJobBody,
  ): Promise<JobModel> {
    return this.jobsService.create(ctx.req.user.sub, companyId, jobData);
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
