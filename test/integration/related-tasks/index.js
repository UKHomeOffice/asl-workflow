const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const assertTasks = require('../../helpers/assert-tasks');

describe('Related tasks', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
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

  describe('Pagination', () => {
    const allTasks = [
      'pil returned',
      'pil with licensing',
      'place update with licensing',
      'place update with inspector',
      'place update recommended',
      'assigned to inspector',
      'place update returned',
      'place update recommend rejected',
      'granted pil',
      'granted place update'
    ];

    it('can limit the number of rows returned', () => {
      this.workflow.setUser({ profile: holc });
      const expected = allTasks.slice(0, 3);

      return request(this.workflow)
        .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&limit=3`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can paginate through the resultset', () => {
      this.workflow.setUser({ profile: holc });
      const expected = allTasks.slice(3, 6);

      return request(this.workflow)
        .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&limit=3&offset=3`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });
  });

  describe('Only open tasks', () => {
    it('can filter out resolved / rejected tasks', () => {
      this.workflow.setUser({ profile: holc });
      const expected = [
        'place update with licensing',
        'place update with inspector',
        'place update recommended',
        'place update returned',
        'place update recommend rejected',
        'assigned to licensing',
        'assigned to inspector'
        // 'granted place update' this task should be filtered out
      ];

      return request(this.workflow)
        .get('/related-tasks?model=establishment&modelId=100&onlyOpen=true&limit=10000')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });
  });

});
