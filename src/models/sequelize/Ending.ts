import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface EndingAttributes {
  id: number;
  storyId: number;
  pageId: number;
  name: string;
  rarityId: number;
}

type EndingCreation = Optional<EndingAttributes, 'id'>;

export class Ending extends Model<EndingAttributes, EndingCreation> implements EndingAttributes {
  declare id: number;
  declare storyId: number;
  declare pageId: number;
  declare name: string;
  declare rarityId: number;
}

Ending.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    rarityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  { tableName: 'endings', sequelize }
);

export default Ending;
