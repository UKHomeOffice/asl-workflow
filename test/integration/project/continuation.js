const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { holc, userWithActivePil } = require('../../data/profiles');
const ids = require('../../data/ids');

describe('Project continuation', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: holc });
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

  it('adds a continuation property to task data', () => {
    const payload = {
      model: 'project',
      action: 'grant',
      establishmentId: 100,
      id: ids.model.project.continuation,
      data: {
        version: ids.model.projectVersion.continuation
      }
    };
    const expected = [
      {
        'licence-number': '70/1234',
        'expiry-date': '2022-02-01'
      }
    ];
    return request(this.workflow)
      .post('/')
      .send(payload)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepEqual(task.data.continuation, expected);
      });
  });

  it('sets continuation to null if transfer-expiring not true', () => {
    const payload = {
      model: 'project',
      action: 'grant',
      establishmentId: 100,
      id: ids.model.project.notAContinuation,
      data: {
        version: ids.model.projectVersion.notAContinuation
      }
    };
    return request(this.workflow)
      .post('/')
      .send(payload)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepEqual(task.data.continuation, null);
      });
  });

  it('decorates project grant tasks with continuation if not set on create', () => {
    const expected = [
      {
        'licence-number': '30/1234',
        'expiry-date': '2021-02-01'
      }
    ];
    this.workflow.setUser({ profile: userWithActivePil });
    return request(this.workflow)
      .get(`/${ids.task.project.continuation}`)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepEqual(task.data.continuation, expected);
      });
  });

  it('sets continuation to null on project tasks without continution', () => {
    this.workflow.setUser({ profile: holc });
    return request(this.workflow)
      .get(`/${ids.task.project.submittedByHolc}`)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepEqual(task.data.continuation, null);
      });
  });
});
