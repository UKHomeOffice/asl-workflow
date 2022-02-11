const request = require('supertest');
const sinon = require('sinon');
const workflowHelper = require('../../helpers/workflow');
const { holc, user, userAtMultipleEstablishments, licensing, asruSuper } = require('../../data/profiles');
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

  describe('All tasks the profile has interacted with', () => {

    describe('Establishment admin', () => {
      it('returns all tasks their own profile has interacted with', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: sinon.match.any, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'pil returned',
          'pil with licensing',
          'place update with licensing',
          'place update with inspector',
          'place update returned',
          'place update recommended',
          'place update recommend rejected',
          'granted pil',
          'granted place update',
          'rejected pil',
          'establishment amendment',
          'Submitted by HOLC',
          'ppl submitted by HOLC for user',
          'profile update holc',
          'holc pil with licensing',
          'holc owned project',
          'granted establishment update',
          'granted nio role at croydon',
          'discarded by asru',
          'project amendment initiated by asru',
          'legacy project amendment',
          'assigned to inspector',
          'Project amendment rejection'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks a user interacted with at an establishment the admin is an admin at', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: sinon.match.any, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'project at Croydon',
          'granted nio role at croydon'
          // 'project at Marvell' should not appear
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for establishments the user is not an admin at', () => {
        const can = sinon.stub().withArgs('profile.relatedTasks', { id: sinon.match.any, establishment: '101' }).resolves(false);
        this.workflow.setUser({ profile: holc, can });

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&establishmentId=101&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile: ${userAtMultipleEstablishments.id}`);
          });
      });
    });

    describe('Asru user', () => {
      beforeEach(() => {
        const can = sinon.stub().withArgs('profile.relatedTasks', sinon.match.any).resolves(true);
        this.workflow.setUser({ profile: licensing, can });
      });

      it('returns all tasks interacted with by the user at all establishments', () => {
        const expected = [
          'pil transfer recalled',
          'project at Croydon',
          'granted nio role at croydon',
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('includes tasks created by the target profile', () => {
        const expected = [
          'project amendment initiated by asru',
          'submitted rop'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${asruSuper.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks.includes(expected, response.body.data);
          });
      });

      it('includes tasks that have been processed by the target profile', () => {
        const expected = [
          'discarded by asru'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${asruSuper.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks.includes(expected, response.body.data);
          });
      });

      it('includes tasks currently assigned to the target user', () => {
        const expected = [
          'with licensing assigned to superuser',
          'with inspectorate assigned to superuser'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${asruSuper.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks.includes(expected, response.body.data);
          });
      });

      it('does not include tasks assigned to other users by the target profile', () => {
        const unexpected = ['assigned to licensing'];
        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${asruSuper.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks.excludes(unexpected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks their own profile has interacted with', () => {
        const can = sinon.stub()
          .withArgs('profile.relatedTasks', { id: userAtMultipleEstablishments.id, establishment: undefined })
          .resolves(true);
        this.workflow.setUser({ profile: userAtMultipleEstablishments, can });

        const expected = [
          'pil transfer recalled',
          'project at Croydon',
          'granted nio role at croydon',
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an error when trying to fetch tasks for other profiles', () => {
        const can = sinon.stub()
          .withArgs('profile.relatedTasks', { id: user.id, establishment: undefined })
          .resolves(false);
        this.workflow.setUser({ profile: userAtMultipleEstablishments, can });

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${user.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile: ${user.id}`);
          });
      });
    });

  });

});
