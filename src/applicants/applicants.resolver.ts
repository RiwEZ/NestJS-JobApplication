import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { ApplicantModel } from './applicants.model';
import { ApplicantsService } from './applicants.service';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => ApplicantModel)
export class ApplicantsResolver {
  constructor(private applicantsService: ApplicantsService) {}

  @Query(() => [ApplicantModel])
  async applicants(
    // @Context() ctx: GraphQLContext,
    @Args('jobId') jobId: string,
  ): Promise<ApplicantModel[]> {
    return this.applicantsService.get(jobId);
  }
}
