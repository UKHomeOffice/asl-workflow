class TimeoutError extends Error {

  constructor() {
    super('Request Timeout');
  }

  get status() {
    return 504;
  }

}

module.exports = TimeoutError;
