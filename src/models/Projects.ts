// src/models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectId: string;
  title: string;
  category: 'desktop' | 'web' | 'mobile';
  description_en: string;
  description_fr: string;
  tech: string[];
  githubLink: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['desktop', 'web', 'mobile'],
      required: true,
    },
    description_en: {
      type: String,
      required: true,
    },
    description_fr: {
      type: String,
      required: true,
    },
    tech: {
      type: [String],
      required: true,
    },
    githubLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);