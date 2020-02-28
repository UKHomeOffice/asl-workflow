const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');

describe('Project create legacy stub', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => workflowHelper.resetDBs());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  it('prevents project stubs being created by anyone other than licensing officers', () => {
    this.workflow.setUser({ profile: user });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'create',
        changedBy: user.id,
        data: {
          title: 'Digitised Paper Licence Stub',
          establishmentId: 8201,
          licenceHolderId: user.id,
          licenceNumber: 'XXX-123-XXX',
          issueDate: new Date('2018-08-15').toISOString(),
          isLegacyStub: true
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU LOs can create legacy stubs');
      });
  });

  // it('autoresolves creation of project stubs by a licensing officer', () => {
  //   this.workflow.setUser({ profile: licensing });

  //   const opts = {
  //     model: 'project',
  //     action: 'create',
  //     changedBy: licensing,
  //     data: {
  //       title: 'Digitised Paper Licence Stub',
  //       establishmentId: 8201,
  //       licenceHolderId: user.id,
  //       licenceNumber: 'XXX-123-XXX',
  //       issueDate: new Date('2018-08-15').toISOString(),
  //       isLegacyStub: true,
  //       version: {
  //         data: {
  //           title: 'Digitised Paper Licence Stub',
  //           duration: {
  //             years: 5,
  //             months: 0
  //           }
  //         }
  //       }
  //     }
  //   };

  //   return request(this.workflow)
  //     .post('/')
  //     .send(opts)
  //     .expect(200)
  //     .then(response => response.body.data)
  //     .then(task => {
  //       assert.equal(task.status, autoResolved.id);
  //     });
  // });

});
