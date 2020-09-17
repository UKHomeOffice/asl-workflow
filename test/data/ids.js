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
      recalledTransfer: uuid(),
      submittedByHolc: uuid(),
      continuation: uuid(),
      discardedByAsru: uuid()
    }
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
      hasPil: uuid()
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
      transfer: uuid(),
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
      marvellTest: uuid()
    },
    projectVersion: {
      recalledTransfer: uuid(),
      continuation: uuid(),
      continuation2: uuid(),
      notAContinuation: uuid(),
      transfer: uuid(),
      grant: uuid(),
      grant2: uuid()
    }
  }
};
