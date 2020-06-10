const { Router } = require('express');
const flow = require('../flow');

module.exports = () => {
  const router = Router();

  router.get('/', (req, res, next) => {

    const open = flow.open();
    const statuses = flow.getAllSteps().reduce((map, status) => {
      return {
        ...map,
        [status.id]: {
          open: open.includes(status.id),
          withASRU: !!status.withASRU
        }
      };
    }, {});

    res.json(statuses);

  });

  return router;
};
