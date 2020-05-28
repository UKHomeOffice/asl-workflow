const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const { withInspectorate } = require('../../../lib/flow/status');

const establishmentId = 102;

describe('Establishment grant', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: user });
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

  it('sends grant requests to the inspectorate', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'grant',
        id: establishmentId,
        changedBy: user.id,
        data: {}
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, withInspectorate.id);
      });
  });

  it('can create a `grant` task with an open `update` task', () => {
    const existing = [
      {
        data: {
          id: establishmentId,
          model: 'establishment',
          action: 'update',
          data: {
            name: 'Updated Name'
          }
        },
        status: withInspectorate.id
      }
    ];
    return this.workflow.seedTaskList(existing)
      .then(() => {
        return request(this.workflow)
          .post('/')
          .send({
            model: 'establishment',
            action: 'grant',
            id: establishmentId,
            changedBy: user.id,
            data: {}
          })
          .expect(200);
      });
  });

  it('cannot create a `grant` task with an open `update` and `grant` task', () => {
    const existing = [
      {
        data: {
          id: establishmentId,
          model: 'establishment',
          action: 'update',
          data: {
            name: 'Updated Name'
          }
        },
        status: withInspectorate.id
      },
      {
        data: {
          id: establishmentId,
          model: 'establishment',
          action: 'grant',
          data: {}
        },
        status: withInspectorate.id
      }
    ];
    return this.workflow.seedTaskList(existing)
      .then(() => {
        return request(this.workflow)
          .post('/')
          .send({
            id: establishmentId,
            model: 'establishment',
            action: 'grant',
            changedBy: user.id,
            data: {}
          })
          .expect(400);
      });
  });

});
