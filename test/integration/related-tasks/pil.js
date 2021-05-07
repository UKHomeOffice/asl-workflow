const request = require('supertest');
const sinon = require('sinon');
const workflowHelper = require('../../helpers/workflow');
const { holc, user, licensing } = require('../../data/profiles');
const ids = require('../../data/ids');
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

  describe('PIL tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks related to their own PIL', () => {
        const can = sinon.stub().withArgs('pil.relatedTasks', { id: ids.model.pil.holc, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'holc pil with licensing'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to another users PIL at their admin establishment', () => {
        const can = sinon.stub().withArgs('pil.relatedTasks', { id: ids.model.pil.active, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'granted pil'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.active}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for PILs at non-admin establishments', () => {
        const can = sinon.stub().withArgs('pil.relatedTasks', { id: sinon.match.any, establishment: '101' }).resolves(false);
        this.workflow.setUser({ profile: holc, can });

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.marvell}&establishmentId=101&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for pil: ${ids.model.pil.marvell}`);
          });
      });
    });

    describe('Asru user', () => {
      beforeEach(() => {
        const can = sinon.stub().withArgs('pil.relatedTasks', sinon.match.any).resolves(true);
        this.workflow.setUser({ profile: licensing, can });
      });

      it('returns all tasks related to a PIL', () => {
        const expected = [
          'holc pil with licensing'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to a PIL at any establishment', () => {
        const expected = [
          'pil at marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks related to their own PIL', () => {
        const can = sinon.stub().withArgs('pil.relatedTasks', { id: ids.model.pil.active, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: user, can });

        const expected = [
          'granted pil'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.active}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {

            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other users PILs', () => {
        const can = sinon.stub().withArgs('pil.relatedTasks', { id: ids.model.pil.holc, establishment: '100' }).resolves(false);
        this.workflow.setUser({ profile: user, can });

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for pil: ${ids.model.pil.holc}`);
          });
      });
    });

  });

});
