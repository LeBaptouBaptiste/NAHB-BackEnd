"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMySQLConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbHost = process.env.MYSQL_HOST || 'mysql';
const dbUser = process.env.MYSQL_USER || 'root';
const dbPass = process.env.MYSQL_PASSWORD || 'rootpassword';
const dbName = process.env.MYSQL_DB || 'nahb';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: 'mysql',
    logging: false,
});
const testMySQLConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('MySQL Connected');
    }
    catch (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
};
exports.testMySQLConnection = testMySQLConnection;
//# sourceMappingURL=mysql.js.map