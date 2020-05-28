const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user, holc, userAtMultipleEstablishments, holc101, asruAdmin, licensing } = require('../../data/profiles');
const { resubmitted, updated, discardedByAsru } = require('../../../lib/flow/status');
const { get } = require('lodash');

const ids = require('../../data/ids');

describe('Next steps', () => {
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

  it('resubmitted appears as an option on a pil.grant task', () => {
    return request(this.workflow)
      .get(`/${ids.task.pil.grant}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.find(s => s.id === resubmitted.id), 'Next steps should include resubmitted');
      });
  });

  it('resubmitted does not appear as an option on a project.grant task', () => {
    return request(this.workflow)
      .get(`/${ids.task.project.grant}`)
      .expect(200)
      .expect(response => {
        assert.ok(!response.body.data.nextSteps.find(s => s.id === resubmitted.id), 'Next steps should not include resubmitted');
      });
  });

  it('updated appears as an option on a recalled pil.transfer task if the user is the applicant', () => {
    this.workflow.setUser({ profile: userAtMultipleEstablishments });

    return request(this.workflow)
      .get(`/${ids.task.pil.transfer}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.find(s => s.id === updated.id), 'Next steps should include updated (edit and resubmit)');
      });
  });

  it('updated does not appear as an option on a recalled pil.transfer task if the user is not the applicant', () => {
    this.workflow.setUser({ profile: holc101 });

    return request(this.workflow)
      .get(`/${ids.task.pil.transfer}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.length > 0, 'Admin user at receiving establishment can action task');
        assert.ok(!response.body.data.nextSteps.find(s => s.id === updated.id), 'Next steps should not include updated (edit and resubmit)');
      });
  });

  it('does not include discard task option for asru non-admins', () => {
    this.workflow.setUser({ profile: licensing });

    const openTasks = [
      'pil.grant',
      'pil.transfer',
      'place.applied',
      'project.grant'
    ];

    return Promise.all(openTasks.map(taskName => {
      const taskUrl = `/${get(ids.task, taskName)}`;
      return request(this.workflow)
        .get(taskUrl)
        .expect(200)
        .expect(response => {
          assert.ok(!response.body.data.nextSteps.find(s => s.id === discardedByAsru.id), 'ASRU LO should not have a discard task option');
        });
    }));
  });

  it('includes discard task option for asru admins for open tasks', () => {
    this.workflow.setUser({ profile: asruAdmin });

    const openTasks = [
      'pil.grant',
      'pil.transfer',
      'place.applied',
      'project.grant'
    ];

    return Promise.all(openTasks.map(taskName => {
      const taskUrl = `/${get(ids.task, taskName)}`;
      return request(this.workflow)
        .get(taskUrl)
        .expect(200)
        .expect(response => {
          assert.ok(response.body.data.nextSteps.find(s => s.id === discardedByAsru.id), 'ASRU Admin should have a discard task option');
        });
    }));
  });

  it('does not include discard task option for asru admins for closed tasks', () => {
    this.workflow.setUser({ profile: asruAdmin });

    const closedTasks = [
      'pil.rejected',
      'place.resolved'
    ];

    return Promise.all(closedTasks.map(taskName => {
      const taskUrl = `/${get(ids.task, taskName)}`;
      return request(this.workflow)
        .get(taskUrl)
        .expect(200)
        .expect(response => {
          assert.ok(!response.body.data.nextSteps.find(s => s.id === discardedByAsru.id), 'ASRU Admin should not have a discard task option');
        });
    }));
  });

  it('does not return any steps for non-ASRU users viewing ASRU initiated tasks', () => {
    this.workflow.setUser({ profile: holc });

    return request(this.workflow)
      .get(`/${ids.task.pil.asruinitiated}`)
      .expect(200)
      .expect(response => {
        assert.deepEqual(response.body.data.nextSteps, [], 'HOLC has no options to update the task');
      });
  });

});
