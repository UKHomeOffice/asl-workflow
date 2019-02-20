const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { user, userWithActivePil } = require('../../data/profiles');
const { autoResolved, withInspectorate } = require('../../../lib/flow/status');

describe('Profile update', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: user });
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  describe('User with no licences or named roles', () => {

    it('auto-resolves changes that don\'t include the name or DOB', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'profile',
          id: user.id,
          action: 'update',
          data: {
            firstName: 'Linford',
            lastName: 'Christie',
            dob: '1960-04-02',
            telephone: '98 765 4321' // telephone changed
          }
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, autoResolved.id);
        });
    });

    it('auto-resolves changes that include the name or DOB', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'profile',
          id: user.id,
          action: 'update',
          data: {
            firstName: 'Linford',
            lastName: 'Christie',
            dob: '1989-01-01', // dob changed
            telephone: '01234567890'
          }
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, autoResolved.id);
        });
    });

  });

  describe('User with an active PIL', () => {
    beforeEach(() => {
      this.workflow.setUser({ profile: userWithActivePil });
    });

    it('auto-resolves changes that don\'t include the name or DOB', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'profile',
          id: userWithActivePil.id,
          action: 'update',
          data: {
            firstName: 'Noddy',
            lastName: 'Holder',
            dob: '1946-06-15',
            telephone: '9876 54321' // telephone changed
          }
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, autoResolved.id);
        });
    });

    it('sends changes to name or DOB to inspectorate', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'profile',
          id: userWithActivePil.id,
          action: 'update',
          data: {
            firstName: 'Barry', // firstName changed
            lastName: 'Holder',
            dob: '1946-06-15',
            telephone: '01234567890'
          }
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, withInspectorate.id);
        });
    });
  });

});
