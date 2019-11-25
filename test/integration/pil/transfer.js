const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { userAtMultipleEstablishments } = require('../../data/profiles');
const { awaitingEndorsement } = require('../../../lib/flow/status');

const pilId = 'ba3f4fdf-27e4-461e-a251-3188faa35df5';

describe('PIL transfer', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: userAtMultipleEstablishments }); // Colin Jackson has a PIL at Croydon
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

  it('prevents transfer by anyone other than the owner of the PIL', () => {
    const notTheOwnerId = 'c0f0b528-5caa-4dee-bf44-170827e35755';

    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'transfer',
        id: pilId,
        changedBy: notTheOwnerId,
        data: {
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

  it('transfers to another associated establishment', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'transfer',
        id: pilId,
        changedBy: userAtMultipleEstablishments.id,
        data: {
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

});
