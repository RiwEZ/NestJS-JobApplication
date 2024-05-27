import { Catch } from '@nestjs/common';
import { GqlExceptionFilter, GraphQLExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { TokenPayload } from 'src/auth/auth.service';

export type GraphQLContext = GraphQLExecutionContext & {
  req: { user: TokenPayload };
};

// custom exception filter, to make GraphQLError not logged
// maybe, this can be use to catch and some internal server error and log them
@Catch(GraphQLError)
export class GraphQLErrFilter implements GqlExceptionFilter {
  catch(exception: GraphQLError) {
    return exception;
  }
}
