module.exports = {
  port: process.env.PORT || 8080,
  sqs: {
    region: process.env.SQS_REGION || 'eu-west-2',
    accessKey: process.env.SQS_ACCESS_KEY,
    secret: process.env.SQS_SECRET,
    url: process.env.SQS_URL
  },
  db: {
    database: process.env.DATABASE_NAME || 'asl',
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME || 'postgres'
  },
  taskflowDB: {
    database: process.env.TASKFLOW_DATABASE_NAME || 'taskflow',
    host: process.env.TASKFLOW_DATABASE_HOST,
    password: process.env.TASKFLOW_DATABASE_PASSWORD,
    port: process.env.TASKFLOW_DATABASE_PORT,
    user: process.env.TASKFLOW_DATABASE_USERNAME || 'postgres'
  },
  auth: {
    realm: process.env.KEYCLOAK_REALM,
    url: process.env.KEYCLOAK_URL,
    client: process.env.KEYCLOAK_CLIENT,
    secret: process.env.KEYCLOAK_SECRET,
    permissions: process.env.PERMISSIONS_SERVICE
  }
};
