import { Args, Resolver, Query, Context, Mutation } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { ApplicantModel } from './applicants.model';
import { ApplicantsService } from './applicants.service';
import { Candidate, Company } from 'src/auth/auth.guard';
import { ApplicantStatus } from './applicants.schema';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => ApplicantModel)
export class ApplicantsResolver {
  constructor(private applicantsService: ApplicantsService) {}

  @Company()
  @Query(() => [ApplicantModel])
  applicants(
    @Context() ctx: GraphQLContext,
    @Args('jobId') jobId: string,
  ): Promise<ApplicantModel[]> {
    return this.applicantsService.get(ctx.req.user.sub, jobId);
  }

  @Company()
  @Mutation(() => ApplicantModel)
  hire(@Args('id') id: string): Promise<ApplicantModel> {
    return this.applicantsService.updateStatus(id, ApplicantStatus.HIRED);
  }

  @Company()
  @Mutation(() => ApplicantModel)
  reject(@Args('id') id: string): Promise<ApplicantModel> {
    return this.applicantsService.updateStatus(id, ApplicantStatus.REJECTED);
  }

  @Candidate()
  @Mutation(() => ApplicantModel)
  applyTo(
    @Context() ctx: GraphQLContext,
    @Args('jobId') jobId: string,
  ): Promise<ApplicantModel> {
    return this.applicantsService.create(ctx.req.user.sub, jobId);
  }
}
