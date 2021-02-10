const request = require('supertest');
const assert = require('assert');
const qs = require('qs');
const workflowHelper = require('../../helpers/workflow');
const { holc, asruSuper } = require('../../data/profiles');

describe('Filtered tasks', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      })
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('External users', () => {
    before(() => {
      this.workflow.setUser({ profile: holc });
    });

    it('cannot query without specifying an establishment', () => {
      return request(this.workflow)
        .get(`/filtered-tasks`)
        .expect(400)
        .then(response => response.body)
        .then(error => {
          assert.equal(error.message, 'establishment must be provided for non-ASRU users');
        });
    });

    it('cannot query establishments they do not belong to', () => {
      const query = {
        filters: {
          establishment: '999'
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(404);
    });

  });

  describe('ASRU users', () => {
    before(() => {
      this.workflow.setUser({ profile: asruSuper });
    });

    it('returns only resolved tasks by default', () => {
      return request(this.workflow)
        .get(`/filtered-tasks`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.status === 'resolved'), 'all tasks should have status: resolved');
        });
    });

    it('can filter by model', () => {
      const query = {
        filters: {
          model: 'place'
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.data.model === 'place'), 'all tasks should have model: place');
        });
    });

    it('can filter by action', () => {
      const query = {
        filters: {
          action: 'grant'
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.data.action === 'grant'), 'all tasks should have action: grant');
        });
    });

    it('can filter by who initiated the task', () => {
      const query = {
        filters: {
          initiatedBy: 'asru'
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.data.initiatedByAsru === true), 'all tasks should have initiatedByAsru: true');
        });
    });

    it('can filter by type is amendment', () => {
      const query = {
        filters: {
          isAmendment: true
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.type === 'amendment'), 'all tasks should have type: amendment');
        });
    });

    it('can filter by establishment', () => {
      const query = {
        filters: {
          establishment: 101
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.data.establishmentId === 101), 'all tasks should have establishmentId: 101');
        });
    });

    it('can filter by project schema version', () => {
      const query = {
        filters: {
          model: 'project',
          schemaVersion: 0
        }
      };

      return request(this.workflow)
        .get(`/filtered-tasks?${qs.stringify(query)}`)
        .expect(200)
        .then(response => response.body.data)
        .then(tasks => {
          assert.ok(tasks.every(task => task.data.modelData.schemaVersion === 0), 'all tasks should have schemaVersion: 0');
        });
    });
  });

});
