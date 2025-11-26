import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface CommentAttributes {
  id: number;
  storyId: string;
  userId: number;
  content: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedByUserId?: number;
}

type CommentCreation = Optional<CommentAttributes, 'id' | 'isDeleted' | 'deletedAt' | 'deletedByUserId'>;

export class Comment extends Model<CommentAttributes, CommentCreation> implements CommentAttributes {
  declare id: number;
  declare storyId: string;
  declare userId: number;
  declare content: string;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare deletedByUserId?: number;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: DataTypes.STRING(2000), allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE },
    deletedByUserId: { type: DataTypes.INTEGER.UNSIGNED },
  },
  { tableName: 'comments', sequelize }
);

export default Comment;
