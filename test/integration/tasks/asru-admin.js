const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { asruAdmin } = require('../../data/profiles');
const { discardedByAsru } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('ASRU Admins', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: asruAdmin });
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('Open tasks', () => {

    it('can discard a submitted pil application', () => {
      return request(this.workflow)
        .put(`/${ids.task.pil.grant}/status`)
        .send({
          status: discardedByAsru.id,
          meta: {
            comment: 'ASRU discarding a pil'
          }
        })
        .expect(200);
    });

  });

  describe('Closed tasks', () => {

    it('cannot discard a rejected pil application', () => {
      return request(this.workflow)
        .put(`/${ids.task.pil.rejected}/status`)
        .send({
          status: discardedByAsru.id,
          meta: {
            comment: 'ASRU discarding a rejected pil'
          }
        })
        .expect(400);
    });

  });
});
