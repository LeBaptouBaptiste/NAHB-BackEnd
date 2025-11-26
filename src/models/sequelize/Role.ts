// src/models/sequelize/Role.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
}

type RoleCreation = Optional<RoleAttributes, 'id' | 'description'>;

export class Role extends Model<RoleAttributes, RoleCreation> implements RoleAttributes {
  declare id: number;
  declare name: string;
  declare description?: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: 'roles',
    sequelize,
    timestamps: false,
  }
);

export default Role;
