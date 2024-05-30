import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { join } from 'path';
import { ApplicantsModule } from './applicants/applicants.module';
import { CandidatesModule } from './candidates/candidates.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true, // on dev
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    CompaniesModule,
    ApplicantsModule,
    CandidatesModule,
  ],
})
export class AppModule {}
