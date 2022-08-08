const uuid = require('uuid/v4');

module.exports = {
  task: {
    pil: {
      grant: uuid(),
      withNtco: uuid(),
      withNtcoOwnPil: uuid(),
      rejected: uuid(),
      transfer: uuid(),
      asruinitiated: uuid()
    },
    place: {
      applied: uuid(),
      resolved: uuid(),
      returned: uuid(),
      inspector: uuid()
    },
    project: {
      grant: uuid(),
      rejection: uuid(),
      recalledTransfer: uuid(),
      submittedByHolc: uuid(),
      continuation: uuid(),
      refuseSubmitted: uuid(),
      refuseDeadlineFutureWithUser: uuid(),
      refuseDeadlinePassedWithUser: uuid(),
      refuseDeadlineFutureWithAsru: uuid(),
      refuseDeadlinePassedWithAsru: uuid(),
      discardedByAsru: uuid(),
      grantRa: uuid(),
      hasDeadline: uuid(),
      hasDeadlineReturned: uuid(),
      hasDeadlineAmendment: uuid(),
      hasDeadlineRA: uuid(),
      transfer2: uuid()
    },
    assignedToLicensing: uuid()
  },
  model: {
    pil: {
      active: uuid(),
      linfordChristie: uuid(),
      inactive: uuid(),
      applied: uuid(),
      rejected: uuid(),
      transfer: uuid(),
      holc: uuid(),
      marvell: uuid()
    },
    trainingPil: {
      noPil: uuid(),
      hasPil: uuid(),
      active: uuid()
    },
    trainingCourse: uuid(),
    certificate: {
      colinJackson: uuid()
    },
    place: {
      applied: uuid(),
      resolved: uuid(),
      returned: uuid(),
      deleted: uuid(),
      withRoles: uuid()
    },
    role: {
      nacwoClive: uuid(),
      nacwoDerek: uuid(),
      holc: uuid()
    },
    project: {
      grant: uuid(),
      amend: uuid(),
      rejection: uuid(),
      transfer: uuid(),
      transfer2: uuid(),
      revoke: uuid(),
      recalledTransfer: uuid(),
      updateIssueDate: uuid(),
      updateLicenceNumber: uuid(),
      updateStubLicenceHolder: uuid(),
      continuation: uuid(),
      continuation2: uuid(),
      notAContinuation: uuid(),
      holc: uuid(),
      marvell: uuid(),
      marvellTest: uuid(),
      grantRa: uuid(),
      hasDeadline: uuid(),
      refused: uuid()
    },
    projectVersion: {
      rejection: uuid(),
      rejection2: uuid(),
      recalledTransfer: uuid(),
      continuation: uuid(),
      continuation2: uuid(),
      notAContinuation: uuid(),
      transfer: uuid(),
      transfer2: uuid(),
      grant: uuid(),
      grant2: uuid(),
      amend: uuid(),
      amend2: uuid()
    },
    rop: {
      draft: uuid(),
      submitted: uuid()
    }
  }
};
