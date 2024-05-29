import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export enum ApplicantStatus {
  HIRED = 'hired',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

@Schema()
export class Applicant {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  })
  job: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
  })
  candidate: string;
  @Prop({ enum: Object.values(ApplicantStatus) })
  status: ApplicantStatus;
}

export const ApplicantSchema = SchemaFactory.createForClass(Applicant);

ApplicantSchema.index({ job: 1 }, { background: true });
ApplicantSchema.index({ job: 1, user: 1 }, { unique: true, background: true });
