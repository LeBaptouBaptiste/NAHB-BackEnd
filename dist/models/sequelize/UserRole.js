"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class UserRole extends sequelize_1.Model {
}
exports.UserRole = UserRole;
UserRole.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
}, {
    sequelize: mysql_1.sequelize,
    tableName: 'user_roles',
    timestamps: false,
});
//# sourceMappingURL=UserRole.js.map