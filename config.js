module.exports = {
  port: process.env.PORT || 8080,
  sqs: {
    region: process.env.SQS_REGION || 'eu-west-2',
    accessKey: process.env.SQS_ACCESS_KEY,
    secret: process.env.SQS_SECRET,
    url: process.env.SQS_URL
  },
  auth: {
    realm: process.env.KEYCLOAK_REALM,
    url: process.env.KEYCLOAK_URL,
    client: process.env.KEYCLOAK_CLIENT,
    secret: process.env.KEYCLOAK_SECRET,
    permissions: process.env.PERMISSIONS_SERVICE
  }
};
