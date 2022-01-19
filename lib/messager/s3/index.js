const crypto = require('crypto');
const { v4 } = require('uuid');
const { S3 } = require('@asl/service/clients');

module.exports = settings => {
  const s3Client = S3({ s3: settings });

  return data => {

    return Promise.resolve()
      .then(() => {
        if (!settings.transportKey || settings.transportKey.length !== 32) {
          throw new Error(`Invalid transport key setting`);
        }
        const text = JSON.stringify(data);
        const cipher = crypto.createCipheriv('aes-256-cbc', settings.transportKey, settings.transportIV);
        const payload = cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
        return {
          secure: true,
          payload
        };
      })
      .then(payload => {
        const key = v4();
        const params = {
          Bucket: settings.bucket,
          Body: JSON.stringify(payload),
          Key: key,
          ServerSideEncryption: settings.kms ? 'aws:kms' : undefined,
          SSEKMSKeyId: settings.kms
        };
        return new Promise((resolve, reject) => {
          s3Client.putObject(params, function (err, response) {
            return err ? reject(err) : resolve(key);
          });
        });
      });
  };
};
