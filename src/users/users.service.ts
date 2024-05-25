import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(
    username: string,
  ): Promise<{ id: string; username: string; password: string } | undefined> {
    const result = await this.userModel.findOne({ username: username }).exec();

    if (result === null) {
      return undefined;
    }

    return {
      id: result._id.toString(),
      username: result.username,
      password: result.password,
    };
  }

  async create(username: string, password: string): Promise<{ id: string }> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      username,
      password: hashedPassword,
    });
    const result = await user.save();
    return { id: result._id.toString() };
  }
}
