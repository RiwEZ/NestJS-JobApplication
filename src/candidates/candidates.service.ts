import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate } from './candidates.schema';
import { Model, Types } from 'mongoose';
import { CandidateModel, CreateCandidateData } from './candidates.model';
import { GraphQLError } from 'graphql';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidate: Model<Candidate>,
  ) {}

  toModel(data: Candidate & { _id: Types.ObjectId }): CandidateModel {
    return {
      id: data._id.toString(),
      fullname: data.fullname,
      nickname: data.nickname,
      contactInfo: data.contactInfo,
      information: data.information,
    };
  }

  async get(id: string): Promise<CandidateModel> {
    const result = await this.candidate.findOne({ _id: id }).exec();
    if (result === null) {
      throw new GraphQLError(`cannot find candidate with this id ${id}`);
    }
    return this.toModel(result);
  }

  async getByUserId(userId: string): Promise<CandidateModel> {
    const result = await this.candidate.findOne({ owner: userId }).exec();

    if (result === null) {
      throw new GraphQLError('you did not registered as a candidate yet');
    }

    return this.toModel(result);
  }

  async register(
    userId: string,
    data: CreateCandidateData,
  ): Promise<CandidateModel> {
    try {
      const candidate = new this.candidate({
        owner: userId,
        fullname: data.fullname,
        nickname: data.nickname,
        contactInfo: data.contactInfo,
        information: data.information,
      });
      await candidate.save();

      return this.toModel(candidate);
    } catch (err) {
      if (err.code && err.code === 11000) {
        throw new GraphQLError(
          'you have already register as a candidate with this account',
        );
      }
      throw new GraphQLError('internal server error');
    }
  }

  async edit(
    userId: string,
    data: CreateCandidateData,
  ): Promise<CandidateModel> {
    try {
      const result = await this.candidate
        .findOneAndUpdate(
          { owner: userId },
          {
            fullname: data.fullname,
            nickname: data.nickname,
            contactInfo: data.contactInfo,
            information: data.information,
          },
        )
        .exec();

      if (result === null) {
        throw new GraphQLError('you did not registered as a candidate yet');
      }

      return {
        id: result._id.toString(),
        fullname: data.fullname,
        nickname: data.nickname,
        contactInfo: data.contactInfo,
        information: data.information,
      };
    } catch (err) {
      throw new GraphQLError('internal server error');
    }
  }
}
