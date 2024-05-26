import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs/jobs.service';
import { JobsController } from './jobs/jobs.controller';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true, // on dev
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/main'),
    AuthModule,
    UsersModule,
    JobsModule,
    CompaniesModule,
  ],
  controllers: [AppController, JobsController],
  providers: [AppService, JobsService],
})
export class AppModule {}
