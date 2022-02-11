const assert = require('assert');
const request = require('supertest');
const profiles = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');
const ids = require('../../data/ids');

describe('Model data hook', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('Establishment', () => {
    it('attaches establishment model data including authorisations', () => {
      const params = {
        action: 'update',
        model: 'establishment',
        id: 101,
        data: {
          name: 'New establishment name'
        },
        changedBy: profiles.holc.id
      };

      return request(this.workflow)
        .post('/')
        .send(params)
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.data.modelData.name, 'Marvell Pharmaceuticals');
          assert.equal(task.data.modelData.authorisations[0].method, 'cuddles');
        });
    });
  });

  describe('PIL', () => {
    it('attaches PIL including profile', () => {
      const params = {
        action: 'update',
        model: 'pil',
        id: ids.model.pil.active,
        data: {
          status: 'inactive'
        },
        changedBy: profiles.holc.id
      };

      return request(this.workflow)
        .post('/')
        .send(params)
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.data.modelData.status, 'active');
          assert.equal(task.data.modelData.profile.firstName, 'Noddy');
        });
    });
  });

  describe('Project', () => {
    it('attaches Project including licenceHolder', () => {
      const params = {
        action: 'grant',
        model: 'project',
        id: ids.model.project.transfer,
        changedBy: profiles.holc.id,
        establishmentId: 100,
        data: {
          version: ids.model.projectVersion.transfer
        }
      };

      return request(this.workflow)
        .post('/')
        .send(params)
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.data.modelData.status, 'active');
          assert.equal(task.data.modelData.licenceHolder.firstName, 'Colin');
        });
    });
  });

  describe('Place', () => {
    it('attaches place model including roles', () => {
      const params = {
        action: 'update',
        model: 'place',
        id: ids.model.place.withRoles,
        changedBy: profiles.holc.id,
        establishmentId: 100,
        data: {
          name: 'New name'
        }
      };

      return request(this.workflow)
        .post('/')
        .send(params)
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.data.modelData.name, 'Has assigned roles');
          const role = task.data.modelData.roles[0];
          assert.equal(role.type, 'nacwo');
          assert.equal(role.profile.firstName, 'Clive');
        });
    });
  });
});
