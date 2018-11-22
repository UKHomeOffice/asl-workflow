class BadRequestError extends Error {

  constructor(message = 'Bad Request') {
    super(message);
  }

  get status() {
    return 400;
  }

}

module.exports = BadRequestError;
