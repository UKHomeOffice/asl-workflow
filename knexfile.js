module.exports = {

  development: {
    client: 'postgres',
    connection: {
      database: process.env.DATABASE_NAME || 'taskflow',
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME || 'postgres'
    },
    pool: { min: 1, max: 1 },
    seeds: {
      directory: './seeds/taskflow'
    }
  }

};
