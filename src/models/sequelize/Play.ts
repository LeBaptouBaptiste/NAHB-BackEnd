import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PlayAttributes {
  id: number;
  userId: number;
  storyId: number;
  endPageId: number;
  date: Date;
}

type PlayCreation = Optional<PlayAttributes, 'id' | 'date'>;

export class Play extends Model<PlayAttributes, PlayCreation> implements PlayAttributes {
  declare id: number;
  declare userId: number;
  declare storyId: number;
  declare endPageId: number;
  declare date: Date;
}

Play.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    storyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    endPageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'plays', sequelize }
);

export default Play;
