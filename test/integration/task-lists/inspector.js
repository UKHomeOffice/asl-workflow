const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const assertTaskOrder = require('../../helpers/assert-task-order');
const workflowHelper = require('../../helpers/workflow');

const { inspector } = require('../../data/profiles');

describe('Inspector', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: inspector });
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

  describe('my tasks', () => {

    it('sees outstanding tasks assigned to them', () => {
      const expected = [
        'pil conditions recalled',
        'conditions update',
        'assigned to inspector'
      ];

      return request(this.workflow)
        .get('/?progress=myTasks')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by oldest first', () => {
      return request(this.workflow)
        .get('/?progress=myTasks')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'ascending');
        });
    });

  });

  describe('outstanding tasks', () => {

    it('sees tasks with a status of referred to inspector', () => {
      const expected = [
        'pil conditions recalled',
        'place update with inspector',
        'conditions update',
        'establishment amendment',
        'remove named person',
        'add named person',
        'establishment application',
        'another with-inspectorate to test ordering',
        'holc with multiple establishments',
        'ppl submitted by HOLC for user',
        'assigned to inspector',
        'with inspectorate assigned to superuser',
        'retrospective assessment submitted',
        'project application has deadline',
        'project amendment has deadline',
        'project application has deadline but RA',
        'project transfer in progress',
        'project amendment in progress',
        'project continuation in progress',
        'project revocation in progress',
        'project change of licence holder in progress',
        'ppl application submitted',
        'ppl notified of intention to refuse - resubmitted - deadline not passed',
        'ppl notified of intention to refuse - resubmitted - deadline has passed'
      ];
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by oldest first', () => {
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'ascending');
        });
    });

  });

  describe('in progress tasks', () => {

    it('sees tasks with appropriate statuses', () => {
      const expected = [
        'pil returned',
        'pil with licensing',
        'pil transfer recalled',
        'place update with licensing',
        'place update returned',
        'place update with licensing - other establishment',
        'place update recommended',
        'place update recommend rejected',
        'Submitted by HOLC',
        'another with-licensing to test ordering',
        'holc pil with licensing',
        'holc owned project',
        'assigned to licensing',
        'with licensing assigned to superuser',
        'project application has deadline but returned',
        'ppl notified of intention to refuse - deadline not passed',
        'ppl notified of intention to refuse - deadline has passed'
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
        'submitted rop',
        'Project amendment rejection'
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
