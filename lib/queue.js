const AWS = require('aws-sdk');

module.exports = settings => {

  const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region: settings.region,
    accessKeyId: settings.accessKey,
    secretAccessKey: settings.secret
  });

  return data => {
    return Promise.resolve()
      .then(() => {
        const params = {
          QueueUrl: settings.url,
          MessageBody: JSON.stringify(data)
        };
        return new Promise((resolve, reject) => {
          sqs.sendMessage(params, (err, response) => {
            return err ? reject(err) : resolve(response);
          });
        });
      });
  };

};
