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

  async get(userId: string): Promise<CandidateModel> {
    const result = await this.candidate.findOne({ owner: userId }).exec();

    if (result === null) {
      throw new GraphQLError('you did not registered as a candidate yet');
    }

    return this.toModel(result);
  }

  async getAll(): Promise<CandidateModel[]> {
    const result = await this.candidate.find().exec();
    return result.map((item) => this.toModel(item));
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
}
