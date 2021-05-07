const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const assertTaskOrder = require('../../helpers/assert-task-order');
const workflowHelper = require('../../helpers/workflow');

const { asruAdmin } = require('../../data/profiles');

describe('ASRU user - neither inspector nor LO', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: asruAdmin });
      });
  });

  before(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('in progress tasks', () => {

    it('sees tasks with appropriate statuses', () => {
      const expected = [
        'pil returned',
        'pil transfer recalled',
        'pil with licensing',
        'place update with licensing',
        'place update with licensing - other establishment',
        'place update with inspector',
        'place update recommended',
        'place update returned',
        'place update recommend rejected',
        'conditions update',
        'Submitted by HOLC',
        'another with-inspectorate to test ordering',
        'another with-licensing to test ordering',
        'holc with multiple establishments',
        'ppl submitted by HOLC for user',
        'holc pil with licensing',
        'holc owned project',
        'assigned to licensing',
        'assigned to inspector',
        'with licensing assigned to superuser',
        'with inspectorate assigned to superuser'
      ];
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by newest first', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending');
        });
    });

  });

  describe('completed tasks', () => {

    it('sees all closed tasks', () => {
      const expected = [
        'granted pil',
        'granted place update',
        'granted place update - other establishment',
        'rejected pil',
        'discarded ppl',
        'discarded by asru',
        'profile update',
        'profile update holc',
        'profile update user101',
        'granted establishment update',
        'granted nio role at croydon',
        'pil at marvell',
        'project amendment initiated by asru',
        'legacy project amendment',
        'submitted rop'
      ];
      return request(this.workflow)
        .get('/?progress=completed')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by newest first', () => {
      return request(this.workflow)
        .get('/?progress=completed')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending');
        });
    });

  });

});
