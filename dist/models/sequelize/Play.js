"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Play = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Play extends sequelize_1.Model {
}
exports.Play = Play;
Play.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    storyId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    endPageId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
}, { tableName: 'plays', sequelize: mysql_1.sequelize });
exports.default = Play;
//# sourceMappingURL=Play.js.map