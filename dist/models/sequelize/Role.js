"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
// src/models/sequelize/Role.ts
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
    },
}, {
    tableName: 'roles',
    sequelize: mysql_1.sequelize,
    timestamps: false,
});
exports.default = Role;
//# sourceMappingURL=Role.js.map