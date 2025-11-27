import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/mysql";

interface PlayAttributes {
	id: number;
	userId: number;
	storyId: string;
	endPageId: string;
	date: Date;
}

type PlayCreation = Optional<PlayAttributes, "id" | "date">;

export class Play
	extends Model<PlayAttributes, PlayCreation>
	implements PlayAttributes
{
	declare id: number;
	declare userId: number;
	declare storyId: string;
	declare endPageId: string;
	declare date: Date;
}

Play.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
		storyId: { type: DataTypes.STRING, allowNull: false },
		endPageId: { type: DataTypes.STRING, allowNull: false },
		date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{ tableName: "plays", sequelize }
);

export default Play;
