import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    role: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare public id: number;
    declare public username: string;
    declare public email: string;
    declare public password_hash: string;
    declare public role: string;
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
        role: {
            type: DataTypes.ENUM('admin', 'author', 'reader', 'banned'),
            defaultValue: 'reader',
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export default User;
