const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const { resolved, withInspectorate } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

const currentPlaceData = {
  establishmentId: 100,
  site: 'Lunar House',
  name: 'Has assigned roles',
  suitability: ['SA'],
  holding: ['STH'],
  area: null,
  restrictions: null,
  roles: [ids.model.role.nacwoClive]
};

describe('Place update', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: holc });
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

  it('resolves updates by external users that only modify the assigned roles', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'update',
        id: ids.model.place.withRoles,
        changedBy: holc.id,
        data: {
          ...currentPlaceData,
          roles: [ids.model.role.nacwoDerek]
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, resolved.id);
      });
  });

  it('if it includes changes other than roles, it gets sent to the inspectorate', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'place',
        action: 'update',
        id: ids.model.place.withRoles,
        changedBy: holc.id,
        data: {
          ...currentPlaceData,
          roles: [ids.model.role.nacwoDerek],
          name: 'A new name'
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, withInspectorate.id);
      });
  });
});
