const assert = require('assert');
const sinon = require('sinon');
const {
  awaitingEndorsement,
  withInspectorate,
  withLicensing,
  returnedToApplicant,
  referredToInspector
} = require('../../../../lib/flow/status');
const History = require('../../../helpers/history');
const hook = require('../../../../lib/hooks/endorsed/pil');

const runHook = hook({});

describe('PIL endorse hook', () => {

  beforeEach(() => {
    this.model = {
      data: {
        model: 'pil',
        action: 'grant',
        data: {}
      },
      meta: {
        user: {}
      },
      activityLog: [],
      setStatus: sinon.stub(),
      patch: sinon.stub()
    };
  });

  it('moves task to licensing by default', () => {
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.ok(this.model.setStatus.calledWith(withLicensing.id));
      });
  });

  it('moves task to inspectors if it was previously referred', () => {
    const history = History(this.model);
    history.status(withLicensing.id);
    history.status(referredToInspector.id);
    history.status(returnedToApplicant.id);
    history.status(awaitingEndorsement.id);

    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.ok(this.model.setStatus.calledWith(withInspectorate.id));
      });
  });

  it('moves task to inspectors if it was previously with inspectorate', () => {
    const history = History(this.model);
    history.status(withLicensing.id);
    history.status(referredToInspector.id);
    history.status(returnedToApplicant.id);
    history.status(awaitingEndorsement.id);
    history.status(withInspectorate.id);
    history.status(returnedToApplicant.id);
    history.status(awaitingEndorsement.id);

    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.ok(this.model.setStatus.calledWith(withInspectorate.id));
      });
  });

});
