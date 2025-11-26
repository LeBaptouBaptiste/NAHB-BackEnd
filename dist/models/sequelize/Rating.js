"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Rating extends sequelize_1.Model {
}
exports.Rating = Rating;
Rating.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    storyId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comment: {
        type: sequelize_1.DataTypes.STRING(2000),
    },
}, {
    tableName: 'ratings',
    sequelize: mysql_1.sequelize,
});
exports.default = Rating;
//# sourceMappingURL=Rating.js.map