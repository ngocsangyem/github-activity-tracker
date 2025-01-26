import dotenv from 'dotenv';

dotenv.config();

export const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  ORG_NAME: process.env.ORG_NAME,
  DB_PATH: process.env.DB_PATH,
};