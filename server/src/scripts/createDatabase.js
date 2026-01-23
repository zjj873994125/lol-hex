require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

async function createDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lolhaikesisql',
  };

  try {
    // 先连接到 MySQL 服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    console.log('Connected to MySQL server.');

    // 创建数据库（如果不存在）
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database "${config.database}" created or already exists.`);

    await connection.end();

    // 连接到创建的数据库
    const sequelize = new Sequelize(
      config.database,
      config.user,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        logging: false,
      }
    );

    await sequelize.authenticate();
    console.log('Connected to the database.');

    await sequelize.close();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDatabase();
