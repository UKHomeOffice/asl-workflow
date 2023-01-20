const request = require('supertest');
const assert = require('assert');
const moment = require('moment-business-time');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const ids = require('../../data/ids');

describe('Project deadlines', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return this.workflow.resetDBs();
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('sets internal deadline for a first time submission', () => {
    this.workflow.setUser({ profile: holc });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'grant',
        id: ids.model.project.grant,
        changedBy: holc.id,
        data: {
          version: ids.model.projectVersion.grant,
          establishmentId: 100
        }
      })
      .expect(200)
      .then(response => response.body)
      .then(body => {
        assert.ok(body.data.data.internalDeadline.standard);
        assert.equal(moment(body.data.data.internalDeadline.standard).workingDiff(moment(), 'calendarDays'), 40);
      });
  });

  it('sets internal deadline for an amendment', () => {
    this.workflow.setUser({ profile: holc });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'grant',
        id: ids.model.project.amend,
        changedBy: holc.id,
        data: {
          version: ids.model.projectVersion.amend,
          establishmentId: 100
        }
      })
      .expect(200)
      .then(response => response.body)
      .then(body => {
        assert.ok(body.data.data.internalDeadline.standard);
        assert.equal(moment(body.data.data.internalDeadline.standard).workingDiff(moment(), 'calendarDays'), 40);
      });
  });

  it('sets statutory deadline for first time application if complete and correct', () => {
    this.workflow.setUser({ profile: holc });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'grant',
        id: ids.model.project.grant,
        changedBy: holc.id,
        data: {
          version: ids.model.projectVersion.grant,
          establishmentId: 100
        },
        meta: {
          ready: 'yes',
          awerb: 'yes',
          authority: 'yes'
        }
      })
      .expect(200)
      .then(response => response.body)
      .then(body => {
        assert.ok(body.data.data.deadline);
        assert.equal(moment(body.data.data.deadline.standard).workingDiff(moment(), 'calendarDays'), 40);
        assert.equal(moment(body.data.data.deadline.extended).workingDiff(moment(), 'calendarDays'), 55);
      });
  });

  it('does not set sets statutory deadline for amendment', () => {
    this.workflow.setUser({ profile: holc });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'grant',
        id: ids.model.project.amend,
        changedBy: holc.id,
        data: {
          version: ids.model.projectVersion.amend,
          establishmentId: 100
        },
        meta: {
          ready: 'yes',
          awerb: 'yes',
          authority: 'yes'
        }
      })
      .expect(200)
      .then(response => response.body)
      .then(body => {
        assert.ok(!body.data.data.deadline);
      });
  });

});
