import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface StoryAttributes {
  id: number;
  title: string;
  shortDescription: string;
  authorId: number;
  theme?: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'suspended';
  startPageId?: number;
}

type StoryCreation = Optional<StoryAttributes, 'id' | 'theme' | 'imageUrl' | 'startPageId'>;

export class Story extends Model<StoryAttributes, StoryCreation> implements StoryAttributes {
  declare id: number;
  declare title: string;
  declare shortDescription: string;
  declare authorId: number;
  declare theme?: string;
  declare imageUrl?: string;
  declare status: 'draft' | 'published' | 'suspended';
  declare startPageId?: number;
}

Story.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    shortDescription: { type: DataTypes.STRING(500), allowNull: false },
    authorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    theme: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('draft', 'published', 'suspended'), defaultValue: 'draft' },
    startPageId: { type: DataTypes.INTEGER.UNSIGNED },
  },
  { tableName: 'stories', sequelize }
);

export default Story;
