"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Comment extends sequelize_1.Model {
}
exports.Comment = Comment;
Comment.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    userId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: sequelize_1.DataTypes.STRING(2000), allowNull: false },
    isDeleted: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: sequelize_1.DataTypes.DATE },
    deletedByUserId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED },
}, { tableName: 'comments', sequelize: mysql_1.sequelize });
exports.default = Comment;
//# sourceMappingURL=Comment.js.map