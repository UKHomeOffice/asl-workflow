const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user, userAtMultipleEstablishments, holc101 } = require('../../data/profiles');
const { resubmitted, updated } = require('../../../lib/flow/status');

const ids = require('../../data/ids');

describe('Next steps', () => {
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

  it('resubmitted appears as an option on a pil.grant task', () => {
    return request(this.workflow)
      .get(`/${ids.pil.grant}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.find(s => s.id === resubmitted.id), 'Next steps should include resubmitted');
      });
  });

  it('resubmitted does not appear as an option on a project.grant task', () => {
    return request(this.workflow)
      .get(`/${ids.project.grant}`)
      .expect(200)
      .expect(response => {
        assert.ok(!response.body.data.nextSteps.find(s => s.id === resubmitted.id), 'Next steps should not include resubmitted');
      });
  });

  it('updated appears as an option on a recalled pil.transfer task if the user is the applicant', () => {
    this.workflow.setUser({ profile: userAtMultipleEstablishments });

    return request(this.workflow)
      .get(`/${ids.pil.transfer}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.find(s => s.id === updated.id), 'Next steps should include updated (edit and resubmit)');
      });
  });

  it('updated does not appear as an option on a recalled pil.transfer task if the user is not the applicant', () => {
    this.workflow.setUser({ profile: holc101 });

    return request(this.workflow)
      .get(`/${ids.pil.transfer}`)
      .expect(200)
      .expect(response => {
        assert.ok(response.body.data.nextSteps.length > 0, 'Admin user at receiving establishment can action task');
        assert.ok(!response.body.data.nextSteps.find(s => s.id === updated.id), 'Next steps should not include updated (edit and resubmit)');
      });
  });

});
