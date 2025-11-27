import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/mysql";

interface ChoiceAttributes {
	id: number;
	pageId: string;
	text: string;
	targetPageId: string;
	conditions?: object;
}

type ChoiceCreation = Optional<ChoiceAttributes, "id" | "conditions">;

export class Choice
	extends Model<ChoiceAttributes, ChoiceCreation>
	implements ChoiceAttributes
{
	declare id: number;
	declare pageId: string;
	declare text: string;
	declare targetPageId: string;
	declare conditions?: object;
}

Choice.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		pageId: { type: DataTypes.STRING, allowNull: false },
		text: { type: DataTypes.STRING, allowNull: false },
		targetPageId: { type: DataTypes.STRING, allowNull: false },
		conditions: { type: DataTypes.JSON },
	},
	{ tableName: "choices", sequelize }
);

export default Choice;
