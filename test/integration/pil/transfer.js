const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { userAtMultipleEstablishments, user, licensing, ntco101 } = require('../../data/profiles');
const { awaitingEndorsement, returnedToApplicant, endorsed } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('PIL transfer', () => {
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

  it('prevents transfer by anyone other than the owner of the PIL', () => {
    this.workflow.setUser({ profile: user });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'transfer',
        id: ids.model.pil.transfer,
        data: {
          // TODO: this is set to the receiving establishment by API - it should be in a create hook.
          establishmentId: 101,
          profileId: userAtMultipleEstablishments.id,
          procedures: ['C'],
          species: ['Mice', 'Rats'],
          establishment: {
            from: {
              id: 100,
              name: 'University of Croydon'
            },
            to: {
              id: 101,
              name: 'Marvell Pharmaceuticals'
            }
          }
        }
      })
      .expect(400)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only the PIL\'s owner can transfer a PIL');
      });
  });

  it('can be submitted by PIL holder', () => {
    this.workflow.setUser({ profile: userAtMultipleEstablishments });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'transfer',
        id: ids.model.pil.transfer,
        data: {
          // TODO: this is set to the receiving establishment by API - it should be in a create hook.
          establishmentId: 101,
          profileId: userAtMultipleEstablishments.id,
          procedures: ['C'],
          species: ['Mice', 'Rats'],
          establishment: {
            from: {
              id: 100,
              name: 'University of Croydon'
            },
            to: {
              id: 101,
              name: 'Marvell Pharmaceuticals'
            }
          }
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, awaitingEndorsement.id);
      });
  });

  it('can be submitted by asru user, and NTCO at receiving can action', () => {
    this.workflow.setUser({ profile: licensing });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'transfer',
        id: ids.model.pil.transfer,
        data: {
          // TODO: this is set to the receiving establishment by API - it should be in a create hook.
          establishmentId: 101,
          profileId: userAtMultipleEstablishments.id,
          procedures: ['C'],
          species: ['Mice', 'Rats'],
          establishment: {
            from: {
              id: 100,
              name: 'University of Croydon'
            },
            to: {
              id: 101,
              name: 'Marvell Pharmaceuticals'
            }
          }
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, awaitingEndorsement.id);
        this.workflow.setUser({ profile: ntco101 });
        return request(this.workflow)
          .get(`/${task.id}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            const expected = [
              returnedToApplicant.id,
              endorsed.id
            ];
            assert.deepEqual(task.nextSteps.map(s => s.id).sort(), expected.sort());
          });
      });
  });

});
