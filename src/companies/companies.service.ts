import { Injectable, Logger } from '@nestjs/common';
import { Company } from './companies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyModel, CreateCompanyBody } from './companies.model';
import { GraphQLError } from 'graphql';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(@InjectModel(Company.name) private company: Model<Company>) {}

  async getAll(userId: string | null = null): Promise<CompanyModel[]> {
    const query = userId === null ? {} : { owner: userId };
    const result = await this.company.find(query).exec();
    return result.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      contactInfo: item.contactInfo,
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

  async create(id: string, body: CreateCompanyBody): Promise<CompanyModel> {
    try {
      const company = new this.company({
        owner: id,
        name: body.name,
        description: body.description,
        contactInfo: body.contactInfo,
        isDeleted: false,
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

  async delete(id: string): Promise<CompanyModel> {
    try {
      const result = await this.company.findOneAndDelete({ _id: id }).exec();

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

  async edit(id: string, body: CreateCompanyBody): Promise<CompanyModel> {
    try {
      const result = await this.company
        .findOneAndUpdate(
          { _id: id },
          {
            name: body.name,
            description: body.description,
            contactInfo: body.contactInfo,
          },
        )
        .exec();

      if (result === null) {
        throw new GraphQLError(
          `cannot find a company with an id ${id} that you have permission to edit`,
        );
      }

      return {
        id,
        name: body.name,
        description: body.description,
        contactInfo: body.contactInfo,
      };
    } catch (err) {
      if (err.code && err.code === 11000) {
        throw new GraphQLError(`duplicated company name`);
      }
      throw new GraphQLError(`internal server error`);
    }
  }

  async checkPermission(companyId: string, userId: string): Promise<boolean> {
    const result = await this.company.findOne({
      owner: userId,
      _id: companyId,
    });

    if (result === null) {
      return false;
    }

    return true;
  }
}
