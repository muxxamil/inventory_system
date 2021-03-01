import { Sequelize } from 'sequelize-typescript';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: `${process.cwd()}/.env`});

export const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'mysql',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    models: [`${process.cwd()}/src/models/*.model.ts`],
    modelMatch: (filename, member) => {
      return filename.substring(0, filename.indexOf('.model')) === member;
    },
});