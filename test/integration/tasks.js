const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../helpers/workflow');

const ntcoProfile = {
  id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0',
  establishments: [ { id: 100 } ],
  roles: [ { type: 'ntco', establishmentId: 100 } ]
};

describe('GET / (task list)', () => {
  beforeEach(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      })
      .then(() => workflowHelper.resetDBs());
  });

  afterEach(() => {
    return workflowHelper.destroy();
  });

  it('responds 200', () => {
    return request(this.workflow)
      .get('/')
      .expect(200);
  });

  it('ntcos only see tasks with status "with-ntco"', () => {
    return Promise.resolve()
      .then(() => {
        // make PIL application (grant)
        return request(this.workflow)
          .post('/')
          .set('Content-type', 'application/json')
          .send({
            id: '9fbe0218-995d-47d3-88e7-641fc046d7d1',
            data: {
              profileId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
              establishmentId: 100
            },
            model: 'pil',
            action: 'grant',
            changedBy: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9'
          })
          .expect(200);
      })
      .then(() => {
        this.workflow.setUser({ profile: ntcoProfile });
        return request(this.workflow)
          .get('/')
          .expect(response => {
            const tasks = response.body.data;
            assert.equal(tasks.length, 1, '1 record was returned');
            assert.equal(tasks[0].status, 'with-ntco');
          });
      });
  });

  it('applicants only see tasks that are "returned-to-applicant"', () => {
    return Promise.resolve()
      .then(() => {
        // make PIL application (grant)
        return request(this.workflow)
          .post('/')
          .set('Content-type', 'application/json')
          .send({
            id: '9fbe0218-995d-47d3-88e7-641fc046d7d1',
            data: {
              profileId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
              establishmentId: 100
            },
            model: 'pil',
            action: 'grant',
            changedBy: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9'
          })
          .expect(200);
      })
      .then(() => {
        // fetch the ntco tasks to get the case id
        this.workflow.setUser({ profile: ntcoProfile });
        return request(this.workflow)
          .get('/')
          .then(response => response.body.data[0].id);
      })
      .then(taskId => {
        // ntco rejects PIL application
        this.workflow.setUser({ profile: ntcoProfile });
        return request(this.workflow)
          .put(`/${taskId}/status`)
          .set('Content-type', 'application/json')
          .send({
            status: 'returned-to-applicant',
            comment: 'testing status change by ntco',
            changedBy: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0'
          })
          .expect(200);
      })
      .then(() => {
        this.workflow.setUser(); // reset user to PIL applicant
        return request(this.workflow)
          .get('/')
          .expect(response => {
            const tasks = response.body.data;
            assert.equal(tasks.length, 1, '1 record was returned');
            assert.equal(tasks[0].status, 'returned-to-applicant');
          });
      });
  });

});
