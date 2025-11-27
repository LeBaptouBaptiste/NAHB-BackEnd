import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/mysql";

interface RarityAttributes {
	id: number;
	label: string;
}

type RarityCreation = Optional<RarityAttributes, "id">;

export class Rarity
	extends Model<RarityAttributes, RarityCreation>
	implements RarityAttributes
{
	declare id: number;
	declare label: string;
}

Rarity.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		label: { type: DataTypes.STRING, allowNull: false },
	},
	{ tableName: "rarities", sequelize }
);

export default Rarity;
