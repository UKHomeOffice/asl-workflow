const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');

const ids = require('../../data/ids');

describe('Fee waiver', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  it('can be created even if an open task for the PIL exists', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'feeWaiver',
        action: 'create',
        id: ids.pil.applied,
        data: {
          establishmentId: 100,
          year: 2019
        }
      })
      .expect(200);
  });

});
