import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface PageAttributes {
  id: number;
  storyId: number;
  isEnding: boolean;
}

type PageCreation = Optional<PageAttributes, 'id'>;

export class Page extends Model<PageAttributes, PageCreation> implements PageAttributes {
  declare id: number;
  declare storyId: number;
  declare isEnding: boolean;
}

Page.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isEnding: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'pages', sequelize }
);

export default Page;
