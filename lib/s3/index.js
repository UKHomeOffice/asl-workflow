const AWS = require('aws-sdk');
const { v4 } = require('uuid');

module.exports = settings => {
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: settings.region,
    accessKeyId: settings.accessKey,
    secretAccessKey: settings.secret
  });

  return data => {
    const key = v4();
    const params = {
      Bucket: settings.bucket,
      Body: JSON.stringify(data),
      Key: key,
      SSEKMSKeyId: settings.kms
    };
    return new Promise((resolve, reject) => {
      s3.putObject(params, function (err, response) {
        return err ? reject(err) : resolve(key);
      });
    });
  };
};
