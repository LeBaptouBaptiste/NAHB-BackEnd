import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/mysql";

interface RatingAttributes {
	id: number;
	storyId: string;
	userId: number;
	value: number;
	comment?: string;
}

type RatingCreation = Optional<RatingAttributes, "id" | "comment">;

export class Rating
	extends Model<RatingAttributes, RatingCreation>
	implements RatingAttributes
{
	declare id: number;
	declare storyId: string;
	declare userId: number;
	declare value: number;
	declare comment?: string;
}

Rating.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},

		storyId: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		userId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},

		value: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			validate: {
				min: 1,
				max: 5,
			},
		},

		comment: {
			type: DataTypes.STRING(2000),
		},
	},
	{
		tableName: "ratings",
		sequelize,
	}
);

export default Rating;
