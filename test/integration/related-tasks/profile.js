const request = require('supertest');
const sinon = require('sinon');
const workflowHelper = require('../../helpers/workflow');
const { holc, user, user101, licensing } = require('../../data/profiles');
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

  describe('Profile tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks for their own profile', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: holc.id, establishment: undefined }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = ['profile update holc'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${holc.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other unscoped profiles', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: user.id, establishment: undefined }).resolves(false);
        this.workflow.setUser({ profile: holc, can });

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile: ${user.id}`);
          });
      });
    });

    describe('Asru user', () => {
      beforeEach(() => {
        const can = sinon.stub().withArgs('profile.relatedTasks', sinon.match.any).resolves(true);
        this.workflow.setUser({ profile: licensing, can });
      });

      it('returns all tasks for the requested profile', () => {
        const expected = ['profile update'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks for the requested profile at any establishment', () => {
        const expected = ['profile update user101'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user101.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks for their own profile', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: user.id, establishment: undefined }).resolves(true);
        this.workflow.setUser({ profile: user, can });

        const expected = ['profile update'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other profiles', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: user101.id, establishment: undefined }).resolves(false);
        this.workflow.setUser({ profile: user, can });

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user101.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile: ${user101.id}`);
          });
      });
    });

  });

});
