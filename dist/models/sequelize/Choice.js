"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choice = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Choice extends sequelize_1.Model {
}
exports.Choice = Choice;
Choice.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    pageId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    text: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    targetPageId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    conditions: { type: sequelize_1.DataTypes.JSON },
}, { tableName: 'choices', sequelize: mysql_1.sequelize });
exports.default = Choice;
//# sourceMappingURL=Choice.js.map