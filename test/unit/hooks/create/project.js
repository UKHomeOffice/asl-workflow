const assert = require('assert');
const sinon = require('sinon');
const statuses = require('../../../../lib/flow/status');
const hook = require('../../../../lib/hooks/create/project');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');
const ids = require('../../../data/ids');

const settings = require('../../../helpers/database-settings');

const INSPECTOR_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';
const LICENSING_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d2';
const PELH_ID = 'ae28fb31-d867-4371-9b4f-79019e71232f';
const BASIC_USER = 'ae28fb31-d867-4371-9b4f-79019e71232f';

const {
  awaitingEndorsement,
  endorsed,
  withInspectorate,
  resolved
} = statuses;

describe('Project create hook', () => {
  before(() => {
    const StubMessager = sinon.stub().resolves({});
    return Database(settings.db).init(fixtures.default, true)
      .then(models => {
        this.models = models;
        this.hook = hook({ models, StubMessager });
      });
  });

  after(() => {
    this.models.destroy();
  });

  describe('revocation', () => {

    beforeEach(() => {
      this.model = {
        data: {
          action: 'revoke',
          model: 'project',
          id: ids.model.project.revoke,
          data: {},
          changedBy: PELH_ID
        },
        setStatus: sinon.stub()
      };
    });

    it('is sent to inspectorate if submitted by an establishment', () => {
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], withInspectorate.id);
        });
    });

    it('resolves if submitted by an inspector', () => {
      this.model.data.changedBy = INSPECTOR_ID;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], resolved.id);
        });
    });

    it('is sent to inspectorate if submitted by a licensing officer', () => {
      this.model.data.changedBy = LICENSING_ID;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], withInspectorate.id);
        });
    });

  });

  describe('grant-ra', () => {
    it('requires endorsement if submitted by a basic user', () => {
      const model = {
        data: {
          action: 'grant-ra',
          model: 'project',
          id: ids.model.project.grant,
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'basic' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], awaitingEndorsement.id);
        });
    });

    it('doesn\'t require endorsement if submitted by an admin user', () => {
      const model = {
        data: {
          action: 'grant-ra',
          model: 'project',
          id: ids.model.project.grant,
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'admin' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], endorsed.id);
        });
    });

    it('is resolved immediately if submitted by an ASRU user', () => {
      const model = {
        data: {
          action: 'grant-ra',
          model: 'project',
          id: ids.model.project.grant,
          establishmentId: 100,
          changedBy: LICENSING_ID
        },
        meta: {
          user: {
            profile: {
              id: LICENSING_ID,
              asruUser: true,
              asruLicensing: true,
              establishments: []
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], resolved.id);
        });
    });
  });

  describe('grant', () => {

    it('requires endorsement if submitted by a basic user', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'inactive'
            }
          },
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'basic' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], awaitingEndorsement.id);
        });
    });

    it('requires endorsement if it is an amendment submitted by a basic user', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'active'
            }
          },
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'basic' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], awaitingEndorsement.id);
        });
    });

    it('does not require endorsement if it is an amendment submitted by a licensing officer', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'active'
            }
          },
          establishmentId: 100,
          changedBy: LICENSING_ID
        },
        meta: {
          user: {
            profile: {
              id: LICENSING_ID,
              asruUser: true,
              asruLicensing: true
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], withInspectorate.id);
        });
    });

    it('does not require endorsement if submitted by an admin user', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'inactive'
            }
          },
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'admin' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], endorsed.id);
        });
    });

    it('requires re-endorsement if re-submitted by a basic user without awerb having been completed', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'inactive'
            }
          },
          meta: {
            authority: true
          },
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'basic' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], awaitingEndorsement.id);
        });
    });

    it('requires endorsement every time it is resubmitted regardless of awerb status', () => {
      const model = {
        data: {
          action: 'grant',
          model: 'project',
          id: ids.model.project.grant,
          data: {
            version: ids.model.projectVersion.grant,
            modelData: {
              status: 'inactive'
            }
          },
          meta: {
            authority: true,
            awerb: true
          },
          establishmentId: 100,
          changedBy: BASIC_USER
        },
        meta: {
          user: {
            profile: {
              id: BASIC_USER,
              establishments: [
                { id: 100, role: 'basic' }
              ]
            }
          }
        },
        setStatus: sinon.stub()
      };

      return Promise.resolve()
        .then(() => this.hook(model))
        .then(() => {
          assert.ok(model.setStatus.calledOnce);
          assert.equal(model.setStatus.lastCall.args[0], awaitingEndorsement.id);
        });
    });

  });

});
