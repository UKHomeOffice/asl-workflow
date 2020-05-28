const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('Project update issue date', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
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

  it('prevents issue date being updated by the licence holder', () => {
    this.workflow.setUser({ profile: user });
    const newIssueDate = new Date('2017-01-01').toISOString();

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-issue-date',
        id: ids.model.project.updateIssueDate,
        changedBy: user.id,
        data: {
          issueDate: newIssueDate
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU can change this project property');
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
        id: ids.model.project.updateIssueDate,
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
