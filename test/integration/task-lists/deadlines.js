const request = require('supertest');
const assert = require('assert');
const { get } = require('lodash');
const workflowHelper = require('../../helpers/workflow');
const assertTaskOrder = require('../../helpers/assert-task-order');
const { asruAdmin } = require('../../data/profiles');
const deadlineTasks = require('../../data/deadline-tasks');

const assertDeadlines = (tasks, expected) => {
  expected.forEach(e => {
    const task = tasks.find(t => t.data.data.name === e.name);
    assert.deepEqual(task.activeDeadline, get(task, e.path), task.data.data.name);
  });
};

describe('ASRU task deadlines', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: asruAdmin });
      })
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.db.insert(deadlineTasks));
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('active deadlines', () => {

    it('returns the correct deadline as the active deadline', () => {
      const expected = [
        {
          name: 'active deadline is internal standard (no statutory)',
          path: 'data.internalDeadline.standard'
        },
        {
          name: 'active deadline is internal standard (internal overdue, no statutory)',
          path: 'data.internalDeadline.standard'
        },
        {
          name: 'active deadline is internal/statutory standard (internal and statutory the same)',
          path: 'data.deadline.standard'
        },
        {
          name: 'active deadline is internal standard (internal earlier)',
          path: 'data.internalDeadline.standard'
        },
        {
          name: 'active deadline is statutory standard (internal expired)',
          path: 'data.deadline.standard'
        },
        {
          name: 'active deadline is statutory standard (both expired)',
          path: 'data.deadline.standard'
        },
        {
          name: 'active deadline is internal/statutory extended (internal and statutory the same)',
          path: 'data.internalDeadline.extended'
        },
        {
          name: 'active deadline is statutory extended (internal expired)',
          path: 'data.deadline.extended'
        }
      ];
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertDeadlines(response.body.data, expected);
        });
    });

    it('can sort by active deadline ascending', () => {
      return request(this.workflow)
        .get('/?progress=inProgress&sort%5Bcolumn%5D=activeDeadline&sort%5Bascending%5D=true')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'ascending', 'activeDeadline');
        });
    });

    it('can sort by active deadline descending', () => {
      return request(this.workflow)
        .get('/?progress=inProgress&sort%5Bcolumn%5D=activeDeadline&sort%5Bdescending%5D=true')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending', 'activeDeadline');
        });
    });

  });

});
