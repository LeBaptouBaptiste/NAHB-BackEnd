"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const sequelize_1 = require("sequelize");
const mysql_1 = require("../../config/mysql");
class Report extends sequelize_1.Model {
}
exports.Report = Report;
Report.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    userId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: {
        type: sequelize_1.DataTypes.ENUM('inappropriate_content', 'spam', 'copyright', 'harassment', 'other'),
        allowNull: false,
    },
    description: { type: sequelize_1.DataTypes.STRING(1000) },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
        defaultValue: 'pending',
    },
    adminNotes: { type: sequelize_1.DataTypes.STRING(1000) },
    resolvedBy: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED },
}, { tableName: 'reports', sequelize: mysql_1.sequelize });
exports.default = Report;
//# sourceMappingURL=Report.js.map