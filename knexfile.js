module.exports = {

  development: {
    client: 'postgres',
    connection: {
      database: process.env.DATABASE_NAME || 'taskflow',
      host: process.env.DATABASE_HOST || 'localhost',
      password: process.env.DATABASE_PASSWORD || 'test-password',
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME || 'postgres'
    },
    pool: { min: 1, max: 1 },
    seeds: {
      directory: './seeds'
    }
  },

  test: {
    client: 'postgres',
    connection: {
      database: process.env.DATABASE_NAME || 'taskflow-test',
      host: process.env.DATABASE_HOST || 'localhost',
      password: process.env.DATABASE_PASSWORD || 'test-password',
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME || 'postgres'
    }
  },

  asl: {
    test: {
      client: 'postgres',
      connection: {
        database: process.env.ASL_DATABASE_NAME || 'asl-test',
        host: process.env.ASL_DATABASE_HOST || 'localhost',
        user: process.env.ASL_DATABASE_USERNAME || 'postgres',
        password: process.env.ASL_DATABASE_PASSWORD || 'test-password'
      }
    }
  }

};
