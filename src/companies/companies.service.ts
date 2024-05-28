import { Injectable, Logger } from '@nestjs/common';
import { Company } from './companies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyModel, CreateCompanyBody } from './companies.model';
import { GraphQLError } from 'graphql';
import { GraphQLContext } from 'src/common/utils';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(@InjectModel(Company.name) private company: Model<Company>) {}

  async getAllUndercare(ctx: GraphQLContext): Promise<CompanyModel[]> {
    const result = await this.company
      .find({ admins: { $in: [ctx.req.user.sub] } })
      .exec();

    return result.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      contactInfo: r.contactInfo,
    }));
  }

  async getAll(): Promise<CompanyModel[]> {
    const result = await this.company.find().exec();
    return result.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      contactInfo: r.contactInfo,
    }));
  }

  async get(name: string): Promise<CompanyModel> {
    const result = await this.company.findOne({ name }).exec();
    if (result === null) {
      throw new GraphQLError(`cannot find a company with name ${name}`);
    }

    return {
      id: result._id.toString(),
      name: result.name,
      description: result.description,
      contactInfo: result.contactInfo,
    };
  }

  async create(
    ctx: GraphQLContext,
    body: CreateCompanyBody,
  ): Promise<CompanyModel> {
    try {
      const company = new this.company({
        name: body.name,
        description: body.description,
        contactInfo: body.contactInfo,
        admins: [ctx.req.user.sub],
      });
      await company.save();

      return {
        id: company._id.toString(),
        name: company.name,
        description: company.description,
        contactInfo: company.contactInfo,
      };
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      // check for mongo DuplicateKey error, for duplicated company name
      if (err.code && err.code === 11000) {
        throw new GraphQLError('duplicated company name');
      }
      throw new GraphQLError('internal server error');
    }
  }

  async delete(ctx: GraphQLContext, id: string): Promise<CompanyModel> {
    try {
      const result = await this.company
        .findOneAndDelete({ _id: id, admins: { $in: [ctx.req.user.sub] } })
        .exec();

      if (result === null) {
        throw new GraphQLError(
          `cannot find a company with an id ${id} that you have permission to delete`,
        );
      }
      return {
        id: result._id.toString(),
        name: result.name,
        description: result.description,
        contactInfo: result.contactInfo,
      };
    } catch {
      throw new GraphQLError(`internal server error`);
    }
  }

  async edit(
    ctx: GraphQLContext,
    id: string,
    body: CreateCompanyBody,
  ): Promise<CompanyModel> {
    try {
      const result = await this.company
        .updateOne(
          { _id: id, admins: { $in: [ctx.req.user.sub] } },
          {
            name: body.name,
            description: body.description,
            contactInfo: body.contactInfo,
          },
        )
        .exec();

      if (result.modifiedCount != 1) {
        throw new GraphQLError(
          `cannot find a company with an id ${id} that you have permission to edit`,
        );
      }
    } catch (err) {
      if (err.code && err.code === 11000) {
        throw new GraphQLError(`duplicated company name`);
      }
      throw new GraphQLError(`internal server error`);
    }

    return {
      id,
      name: body.name,
      description: body.description,
      contactInfo: body.contactInfo,
    };
  }

  async checkPermission(companyId: string, userId: string): Promise<boolean> {
    const result = await this.company.findOne({
      _id: companyId,
      admins: { $in: [userId] },
    });

    if (result === null) {
      return false;
    }

    return true;
  }
}
