import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.MYSQL_HOST || 'mysql';
const dbUser = process.env.MYSQL_USER || 'root';
const dbPass = process.env.MYSQL_PASSWORD || 'rootpassword';
const dbName = process.env.MYSQL_DB || 'nahb';

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: 'mysql',
    logging: false,
});

export const testMySQLConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected');
    } catch (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
};
