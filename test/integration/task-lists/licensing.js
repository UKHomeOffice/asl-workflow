const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const assertTaskOrder = require('../../helpers/assert-task-order');
const workflowHelper = require('../../helpers/workflow');

const { licensing } = require('../../data/profiles');

describe('Licensing Officer', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: licensing });
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
        'place update with licensing',
        'assigned to licensing'
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

    it('sees tasks with correct statuses', () => {
      const expected = [
        'pil with licensing',
        'place update with licensing',
        'place update with licensing - other establishment',
        'place update recommended',
        'place update recommend rejected',
        'another with-licensing to test ordering',
        'holc pil with licensing',
        'assigned to licensing',
        'with licensing assigned to superuser'
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

    it('can filter by licence type of pel', () => {
      const pelTasks = [
        'place update with licensing',
        'place update with licensing - other establishment',
        'place update recommended',
        'place update recommend rejected',
        'another with-licensing to test ordering',
        'assigned to licensing',
        'with licensing assigned to superuser'
      ];

      return request(this.workflow)
        .get('/?filters%5Blicence%5D%5B0%5D=pel')
        .expect(200)
        .expect(response => {
          assertTasks(pelTasks, response.body.data);
        });
    });

  });

  describe('in-progress tasks', () => {

    it('sees tasks that are with inspectors or returned to establishments', () => {
      const expected = [
        'pil returned',
        'pil transfer recalled',
        'place update with inspector',
        'place update returned',
        'establishment amendment',
        'remove named person',
        'add named person',
        'establishment application',
        'conditions update',
        'Submitted by HOLC',
        'another with-inspectorate to test ordering',
        'holc with multiple establishments',
        'ppl submitted by HOLC for user',
        'holc owned project',
        'assigned to inspector',
        'with inspectorate assigned to superuser',
        'retrospective assessment submitted',
        'project application has deadline',
        'project application has deadline but returned',
        'project application has deadline but RA',
        'project amendment has deadline',
        'project transfer in progress',
        'project amendment in progress',
        'project continuation in progress',
        'project revocation in progress',
        'project change of licence holder in progress',
        'ppl application submitted',
        'ppl notified of intention to refuse - deadline not passed',
        'ppl notified of intention to refuse - deadline has passed',
        'ppl notified of intention to refuse - resubmitted - deadline not passed',
        'ppl notified of intention to refuse - resubmitted - deadline has passed'
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
