"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rarity = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Rarity extends sequelize_1.Model {
}
exports.Rarity = Rarity;
Rarity.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    label: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { tableName: 'rarities', sequelize: mysql_1.sequelize });
exports.default = Rarity;
//# sourceMappingURL=Rarity.js.map