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
        'establishment application',
        'establishment amendment',
        'add named person',
        'remove named person',
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
        'with inspectorate assigned to superuser',
        'retrospective assessment submitted',
        'project application has deadline',
        'project application has deadline but returned',
        'project amendment has deadline',
        'project application has deadline but RA',
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

    it('can filter by licence type of ppl', () => {
      const expected = [
        'ppl submitted by HOLC for user',
        'holc owned project',
        'retrospective assessment submitted',
        'project application has deadline',
        'project application has deadline but returned',
        'project amendment has deadline',
        'project application has deadline but RA',
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
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is amendments', () => {
      const expected = [
        'project amendment in progress',
        'project amendment has deadline',
        'project transfer in progress',
        'project revocation in progress',
        'project change of licence holder in progress'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=amendments')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is transfers', () => {
      const expected = ['project transfer in progress'];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=transfers')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is continuations', () => {
      const expected = ['project continuation in progress'];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=continuations')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is deadline started', () => {
      const expected = ['project application has deadline'];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=hasDeadline')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is retrospective assessment', () => {
      const expected = [
        'retrospective assessment submitted',
        'project application has deadline but RA'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=ra')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by ppl type is change of licence holder', () => {
      const expected = [
        'project change of licence holder in progress'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=ppl&filters%5BpplType%5D%5B0%5D=changeLicenceHolder')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by licence type of pel', () => {
      const expected = [
        'place update with licensing',
        'place update with licensing - other establishment',
        'assigned to licensing',
        'with licensing assigned to superuser',
        'place update with inspector',
        'assigned to inspector',
        'with inspectorate assigned to superuser',
        'place update recommended',
        'place update returned',
        'place update recommend rejected',
        'establishment application',
        'establishment amendment',
        'add named person',
        'remove named person',
        'conditions update',
        'another with-inspectorate to test ordering',
        'another with-licensing to test ordering',
        'holc with multiple establishments'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pel')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by pel type is amendments', () => {
      const expected = [
        'conditions update',
        'establishment amendment'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pel&filters%5BpelType%5D%5B0%5D=amendments')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by pel type is applications', () => {
      const expected = [
        'establishment application'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pel&filters%5BpelType%5D%5B0%5D=applications')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by pel type is places', () => {
      const expected = [
        'place update with licensing',
        'place update with licensing - other establishment',
        'assigned to licensing',
        'with licensing assigned to superuser',
        'place update with inspector',
        'assigned to inspector',
        'with inspectorate assigned to superuser',
        'place update recommended',
        'place update returned',
        'place update recommend rejected',
        'another with-inspectorate to test ordering',
        'another with-licensing to test ordering',
        'holc with multiple establishments'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pel&filters%5BpelType%5D%5B0%5D=places')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can filter by pel type is roles', () => {
      const expected = [
        'add named person',
        'remove named person'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pel&filters%5BpelType%5D%5B0%5D=roles')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
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
