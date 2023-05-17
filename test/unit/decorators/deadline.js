const assert = require('assert');
const sinon = require('sinon');

const { Task } = require('@ukhomeoffice/asl-taskflow');

const decorator = require('../../../lib/decorators/deadline');

describe('Deadline', () => {

  it('does not set a deadline on recalled tasks', () => {
    const task = {
      status: 'recalled',
      createdAt: '2019-09-20T10:00:00.000Z',
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:recalled',
          createdAt: '2019-09-20T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(!result.data.deadline);
    });
  });

  it('does not set a deadline on returned tasks', () => {
    const task = {
      status: 'returned-to-applicant',
      createdAt: '2019-09-20T10:00:00.000Z',
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-20T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(!result.data.deadline);
    });
  });

  it('does not set a deadline on tasks with deadline removed', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      data: {
        model: 'project',
        action: 'grant',
        removedDeadline: {
          standard: '2019-11-19',
          extended: '2019-12-10',
          isExtended: false,
          isExtendable: true
        },
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(!result.data.deadline);
    });
  });

  it('does not set a deadline on closed tasks', () => {
    const task = {
      status: 'discarded-by-asru',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: false,
      data: {
        model: 'project',
        action: 'grant',
        deadline: {
          standard: '2019-11-19',
          extended: '2019-12-10',
          isExtended: false,
          isExtendable: true
        },
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:discarded-by-asru',
          createdAt: '2019-09-24T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(!result.data.deadline);
    });
  });

  it('does not set a deadline on amendment tasks', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'active'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(!result.data.deadline);
    });
  });

  it('sets a deadline on complete applications with ASRU', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-15');
      assert.equal(result.data.deadline.extended, '2019-12-06');
      assert.equal(result.data.deadline.isExtended, false);
      assert.equal(result.data.deadline.isExtendable, true);
    });
  });

  it('sets a deadline based on the most recent submission', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-19');
      assert.equal(result.data.deadline.extended, '2019-12-10');
      assert.equal(result.data.deadline.isExtended, false);
      assert.equal(result.data.deadline.isExtendable, true);
    });
  });

  it('sets a deadline based on the most recent submission and is not sensitive to ordering of activity log records', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-19');
      assert.equal(result.data.deadline.extended, '2019-12-10');
      assert.equal(result.data.deadline.isExtended, false);
      assert.equal(result.data.deadline.isExtendable, true);
    });
  });

  it('sets an extended deadline if the task deadline has been extended (old style)', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        extended: true,
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-19');
      assert.equal(result.data.deadline.extended, '2019-12-10');
      assert.equal(result.data.deadline.isExtended, true);
      assert.equal(result.data.deadline.isExtendable, false);
    });
  });

  it('sets an extended deadline if the task deadline has been extended (bc for tasks already with-inspectorate)', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        deadline: {
          isExtended: true,
          isExtendable: false // example task was submitted before the change to deadlines and extended afterwards
        },
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-19');
      assert.equal(result.data.deadline.extended, '2019-12-10');
      assert.equal(result.data.deadline.isExtended, true);
      assert.equal(result.data.deadline.isExtendable, false);
    });
  });

  it('does nothing if the task deadline has been extended (new style)', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        deadline: {
          standard: '2019-11-19',
          extended: '2019-12-10',
          isExtended: true,
          isExtendable: false
        },
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      },
      activityLog: [
        {
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          eventName: 'status:with-inspectorate:returned-to-applicant',
          createdAt: '2019-09-21T10:00:00.100Z'
        },
        {
          eventName: 'status:returned-to-applicant:with-inspectorate',
          createdAt: '2019-09-24T10:00:00.100Z'
        }
      ]
    };
    return decorator()(task).then(result => {
      // this is basically a no-op cause the deadline is already saved in the task data
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-19');
      assert.equal(result.data.deadline.extended, '2019-12-10');
      assert.equal(result.data.deadline.isExtended, true);
      assert.equal(result.data.deadline.isExtendable, false);
    });
  });

  it('looks up activity log if none is provided', () => {
    const task = {
      status: 'with-inspectorate',
      createdAt: '2019-09-20T10:00:00.000Z',
      isOpen: true,
      data: {
        model: 'project',
        action: 'grant',
        modelData: {
          status: 'inactive'
        },
        meta: {
          authority: true,
          awerb: true,
          ready: true
        }
      }
    };
    const activityLog = [
      {
        eventName: 'create',
        createdAt: '2019-09-20T10:00:00.000Z'
      },
      {
        eventName: 'status:new:with-inspectorate',
        createdAt: '2019-09-20T10:00:00.100Z'
      }
    ];
    sinon.stub(Task, 'find').resolves({
      toJSON: () => ({ ...task, activityLog })
    });
    return decorator()(task).then(result => {
      assert.ok(result.data.deadline);
      assert.equal(result.data.deadline.standard, '2019-11-15');
      Task.find.restore();
    });
  });

});
