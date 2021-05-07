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

  describe('Project tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks related to their own project', () => {
        const can = sinon.stub().withArgs('project.relatedTasks', { id: ids.model.project.holc, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'holc owned project'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to another users project at their admin establishment', () => {
        const can = sinon.stub().withArgs('project.relatedTasks', { id: ids.model.project.grant, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: holc, can });

        const expected = [
          'recalled ppl',
          'ppl submitted by HOLC for user'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.grant}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for projects at non admin establishments', () => {
        const can = sinon.stub().withArgs('project.relatedTasks', { id: ids.model.project.marvell, establishment: '101' }).resolves(false);
        this.workflow.setUser({ profile: holc, can });

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.marvell}&establishmentId=101&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for project: ${ids.model.project.marvell}`);
          });
      });
    });

    describe('Asru user', () => {
      beforeEach(() => {
        const can = sinon.stub().withArgs('project.relatedTasks', sinon.match.any).resolves(true);
        this.workflow.setUser({ profile: licensing, can });
      });

      it('returns all tasks related to a project', () => {
        const expected = [
          'holc owned project'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to a project at any establishment', () => {
        const expected = [
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks related to their own project', () => {
        const can = sinon.stub().withArgs('project.relatedTasks', { id: ids.model.project.grant, establishment: '100' }).resolves(true);
        this.workflow.setUser({ profile: user, can });

        const expected = [
          'recalled ppl',
          'ppl submitted by HOLC for user'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.grant}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other users projects', () => {
        const can = sinon.stub().withArgs('project.relatedTasks', { id: ids.model.project.holc, establishment: '100' }).resolves(false);
        this.workflow.setUser({ profile: user, can });

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for project: ${ids.model.project.holc}`);
          });
      });
    });

  });

});
