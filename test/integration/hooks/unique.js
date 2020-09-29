const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const profiles = require('../../data/profiles');
const ids = require('../../data/ids');

describe('unique hook', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: profiles.holc });
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

  it('rejects if creating a task where one already exists and is noto with the user', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'update',
        id: ids.model.place.applied,
        data: {
          name: 'failed'
        },
        changedBy: profiles.holc.id
      })
      .expect(400);
  });

  it('rejects if creating a task where one already exists and is not the same type', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'delete',
        id: ids.model.place.returned,
        data: {
          name: 'failed'
        },
        changedBy: profiles.holc.id
      })
      .expect(400);
  });

  it('redirects to existing task is of same model/action type and is with the user', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'update',
        id: ids.model.place.returned,
        data: {
          name: 'updated'
        },
        changedBy: profiles.holc.id
      })
      .expect(200)
      .expect(response => {
        assert.equal(response.body.data.id, ids.task.place.returned);
      });
  });

  it('redirects to existing task if type is grant and there is an existing transfer task', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'grant',
        id: ids.model.project.recalledTransfer,
        data: {
          version: ids.model.projectVersion.recalledTransfer,
          establishmentId: 100
        },
        changedBy: profiles.holc.id
      })
      .expect(200)
      .expect(response => {
        assert.equal(response.body.data.id, ids.task.project.recalledTransfer);
        assert.equal(response.body.data.data.establishmentId, 101, 'the establishment id on the task should be left intact');
      });
  });

  it('updates task data if redirected to an existing task', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'update',
        id: ids.model.place.returned,
        data: {
          name: 'updated'
        },
        changedBy: profiles.holc.id
      })
      .expect(200)
      .expect(response => {
        assert.equal(response.body.data.data.data.name, 'updated');
      });
  });

});
