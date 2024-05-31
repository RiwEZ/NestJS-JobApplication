import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { GraphQLContext, GraphQLErrFilter } from 'src/common/utils';
import { CandidatesService } from './candidates.service';
import { CandidateModel, CreateCandidateData } from './candidates.model';
import { Candidate } from 'src/auth/auth.guard';

@UseFilters(new GraphQLErrFilter())
@Resolver(() => CandidateModel)
export class CandidatesResolver {
  constructor(private candidatesService: CandidatesService) {}

  @Candidate()
  @Query(() => CandidateModel)
  candidateProfile(@Context() ctx: GraphQLContext): Promise<CandidateModel> {
    return this.candidatesService.getByUserId(ctx.req.user.sub);
  }

  @Candidate()
  @Mutation(() => CandidateModel)
  registerCandidate(
    @Context() ctx: GraphQLContext,
    @Args('data') data: CreateCandidateData,
  ): Promise<CandidateModel> {
    return this.candidatesService.register(ctx.req.user.sub, data);
  }

  @Candidate()
  @Mutation(() => CandidateModel)
  editCandidate(
    @Context() ctx: GraphQLContext,
    @Args('data') data: CreateCandidateData,
  ): Promise<CandidateModel> {
    return this.candidatesService.edit(ctx.req.user.sub, data);
  }
}
