import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/mysql';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    banned: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'banned'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
    declare id: number;
    declare username: string;
    declare email: string;
    declare password_hash: string;
    declare banned: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        banned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export default User;
