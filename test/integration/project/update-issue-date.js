const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, inspector, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');

const projectId = 'fa73305f-125e-4e20-bc41-a9bf8cfb3558'; // Test project 4

describe('Project update issue date', () => {
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

  it('prevents issue date being updated by the licence holder', () => {
    this.workflow.setUser({ profile: user });
    const newIssueDate = new Date('2017-01-01').toISOString();

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-issue-date',
        id: projectId,
        changedBy: user.id,
        data: {
          issueDate: newIssueDate
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU licensing officers can change the granted date');
      });
  });

  it('prevents issue date being updated by an inspector', () => {
    this.workflow.setUser({ profile: inspector });
    const newIssueDate = new Date('2017-01-01').toISOString();

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-issue-date',
        id: projectId,
        changedBy: inspector.id,
        data: {
          issueDate: newIssueDate
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU licensing officers can change the granted date');
      });
  });

  it('autoresolves issue date updates by a licensing officer', () => {
    this.workflow.setUser({ profile: licensing });
    const newIssueDate = new Date('2017-01-01').toISOString();

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-issue-date',
        id: projectId,
        changedBy: licensing.id,
        data: {
          issueDate: newIssueDate
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, autoResolved.id);
      });
  });

});
