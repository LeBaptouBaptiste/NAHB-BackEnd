import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface ChoiceAttributes {
  id: number;
  pageId: number;
  text: string;
  targetPageId: number;
  conditions?: object;
}

type ChoiceCreation = Optional<ChoiceAttributes, 'id' | 'conditions'>;

export class Choice extends Model<ChoiceAttributes, ChoiceCreation> implements ChoiceAttributes {
  declare id: number;
  declare pageId: number;
  declare text: string;
  declare targetPageId: number;
  declare conditions?: object;
}

Choice.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    pageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false },
    targetPageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    conditions: { type: DataTypes.JSON },
  },
  { tableName: 'choices', sequelize }
);

export default Choice;
