"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ending = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Ending extends sequelize_1.Model {
}
exports.Ending = Ending;
Ending.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    pageId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    rarityId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, { tableName: 'endings', sequelize: mysql_1.sequelize });
exports.default = Ending;
//# sourceMappingURL=Ending.js.map