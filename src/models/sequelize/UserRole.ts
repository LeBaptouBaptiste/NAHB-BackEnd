import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/mysql";

export class UserRole extends Model {
	declare userId: number;
	declare roleId: number;
}

UserRole.init(
	{
		userId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
		roleId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "user_roles",
		timestamps: false,
	}
);
