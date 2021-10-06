const request = require('supertest');
const assert = require('assert');
const { userAtMultipleEstablishments, holc, holc101, inspector } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');
const { endorsed, returnedToApplicant, resubmitted, awaitingEndorsement } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('Project transfer', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    this.workflow.setUser({ profile: userAtMultipleEstablishments });
    this.payload = {
      model: 'project',
      action: 'grant',
      id: ids.model.project.transfer,
      changedBy: userAtMultipleEstablishments.id,
      establishmentId: 100,
      data: {
        version: ids.model.projectVersion.transfer
      }
    };
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('updates the action to `transfer` and adds the transferToEstablishment to data, and to and from establishments to meta', () => {
    const expected = {
      from: {
        id: 100,
        name: 'University of Croydon'
      },
      to: {
        id: 101,
        name: 'Marvell Pharmaceuticals'
      }
    };
    return request(this.workflow)
      .post('/')
      .send(this.payload)
      .expect(200)
      .then(response => {
        const task = response.body.data;
        assert.equal(task.data.action, 'transfer');
        assert.equal(task.data.data.establishmentId, 101);
        assert.deepEqual(task.data.meta.establishment, expected);
      });
  });

  it('doesn\'t update the action if transferToEstablishment is not included in version', () => {
    const { ProjectVersion } = this.workflow.app.models;
    return ProjectVersion.query().findOne({ projectId: ids.model.project.transfer }).patch({ data: { transferToEstablishment: null } })
      .then(() => request(this.workflow)
        .post('/')
        .send(this.payload)
        .expect(200)
        .then(response => {
          const task = response.body.data;
          assert.equal(task.data.action, 'grant');
          assert.equal(task.data.data.establishmentId, undefined);
        })
      );
  });

  it('doesn\'t update the action if transferToEstablishment is the same as current establishment', () => {
    const { ProjectVersion } = this.workflow.app.models;
    return ProjectVersion.query().findOne({ projectId: ids.model.project.transfer }).patch({ data: { transferToEstablishment: 100 } })
      .then(() => request(this.workflow)
        .post('/')
        .send(this.payload)
        .expect(200)
        .then(response => {
          const task = response.body.data;
          assert.equal(task.data.action, 'grant');
          assert.equal(task.data.data.establishmentId, undefined);
        })
      );
  });

  it('throws an error if licenceHolder is not associated with transferToEstablishment', () => {
    const { ProjectVersion } = this.workflow.app.models;
    return ProjectVersion.query().findOne({ projectId: ids.model.project.transfer }).patch({ data: { transferToEstablishment: 102 } })
      .then(() => request(this.workflow)
        .post('/')
        .send(this.payload)
        .expect(400)
        .then(response => response.body)
        .then(error => {
          assert.equal(error.message, 'User is not associated with Research 102');
        })
      );
  });

  it('updates the establishmentId of the task once endorsed and changes status to awaiting-endorsement', () => {
    return request(this.workflow)
      .post('/')
      .send(this.payload)
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
        assert.equal(response.body.data.status, awaitingEndorsement.id);
      });
  });

  it('cannot be endorsed by an admin at the receiving establishment', () => {
    return request(this.workflow)
      .post('/')
      .send(this.payload)
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

  it('needs re-endorsing each time it is submitted, regardless of awerb status', () => {
    return request(this.workflow)
      .post('/')
      .send(this.payload)
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: holc });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsed from sending est',
              awerb: true
            }
          })
          .expect(200);
      })
      .then(response => {
        const task = response.body.data;
        this.workflow.setUser({ profile: holc101 });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsed from receiving est'
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
        assert.equal(task.status, awaitingEndorsement.id);
      });
  });
});
