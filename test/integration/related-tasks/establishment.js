const request = require('supertest');
const sinon = require('sinon');
const workflowHelper = require('../../helpers/workflow');
const { holc, user, licensing } = require('../../data/profiles');
const assert = require('assert');
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

  describe('Establishment tasks', () => {

    describe('Establishment admin', () => {
      it('returns all establishment, place and role tasks associated with the current establishment', () => {
        const can = sinon.stub().withArgs('establishment.relatedTasks', { establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'place update with licensing',
          'place update with inspector',
          'place update recommended',
          'place update returned',
          'place update recommend rejected',
          'granted place update',
          'granted establishment update',
          'granted nio role at croydon',
          'assigned to licensing',
          'assigned to inspector'
        ];

        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all establishment, place and role tasks associated with the current establishment', () => {
        const can = sinon.stub().withArgs('establishment.relatedTasks', sinon.match.any).resolves(true);
        this.workflow.setUser({ profile: licensing, can });

        const expected = [
          'place update with licensing',
          'place update with inspector',
          'place update recommended',
          'place update returned',
          'place update recommend rejected',
          'granted place update',
          'granted establishment update',
          'granted nio role at croydon',
          'assigned to licensing',
          'assigned to inspector'
        ];

        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('throws an unauthorised error when trying to fetch establishment tasks', () => {
        const can = sinon.stub().withArgs('establishment.relatedTasks', sinon.match.any).resolves(false);
        this.workflow.setUser({ profile: user, can });

        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, 'you do not have permission to view related tasks for establishment: 100');
          });
      });
    });

  });

});
