const request = require('supertest');
const assert = require('assert');
const { userAtMultipleEstablishments, holc, holc101, inspector } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');
const { endorsed, withInspectorate, returnedToApplicant, resubmitted } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

let payload;

describe('Project transfer', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    this.workflow.setUser({ profile: userAtMultipleEstablishments });
    payload = {
      model: 'project',
      action: 'transfer',
      id: ids.model.project.transfer,
      changedBy: userAtMultipleEstablishments.id,
      establishmentId: 100,
      data: {
        establishment: {
          from: {
            id: 100
          },
          to: {
            id: 101
          }
        }
      }
    };
    return Promise.resolve()
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  it('updates the establishmentId of the task once endorsed and changes status to with-inspectorate', () => {
    return request(this.workflow)
      .post('/')
      .send(payload)
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: holc });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsing a transfer'
            }
          })
          .expect(200);
      })
      .then(response => {
        assert.equal(response.body.data.data.establishmentId, 101);
        assert.equal(response.body.data.status, withInspectorate.id);
      });
  });

  it('cannot be endorsed by an admin at the receiving establishment', () => {
    return request(this.workflow)
      .post('/')
      .send(payload)
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: holc101 });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsing a transfer'
            }
          })
          .expect(400);
      })
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Invalid status change: awaiting-endorsement:endorsed');
      });
  });

  it('doesn\'t need re-endorsing if endorsed then returned', () => {
    return request(this.workflow)
      .post('/')
      .send(payload)
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: holc });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsing a transfer'
            }
          })
          .expect(200);
      })
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: inspector });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: returnedToApplicant.id,
            meta: {
              comment: 'returning to applicant'
            }
          })
          .expect(200);
      })
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: userAtMultipleEstablishments });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: resubmitted.id,
            meta: {
              comment: 'resubmitting'
            }
          })
          .expect(200);
      })
      .then(response => {
        const task = response.body.data;
        assert.equal(task.status, withInspectorate.id);
      });
  });
});
