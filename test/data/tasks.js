const uuid = require('uuid/v4');
const { user, userAtMultipleEstablishments, holc, inspector } = require('./profiles');
const ids = require('./ids');
const moment = require('moment');

const generateDates = daysAgo => {
  const date = moment().subtract(daysAgo, 'days').toISOString();
  return {
    createdAt: date,
    updatedAt: date
  };
};

module.exports = query => query.insert([
  {
    id: uuid(),
    data: {
      data: {
        name: 'pil with ntco'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.applied,
      changedBy: user.id
    },
    status: 'with-ntco',
    ...generateDates(0)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'pil with ntco - other establishment'
      },
      establishmentId: 101,
      subject: uuid(),
      model: 'pil',
      action: 'grant',
      changedBy: uuid()
    },
    status: 'with-ntco',
    ...generateDates(1)
  },
  {
    id: ids.task.pil.grant,
    data: {
      data: {
        name: 'pil returned'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'returned-to-applicant',
    ...generateDates(2)
  },
  {
    id: ids.task.pil.transfer,
    data: {
      data: {
        name: 'pil transfer recalled'
      },
      establishmentId: 101,
      subject: userAtMultipleEstablishments.id,
      model: 'pil',
      action: 'transfer',
      changedBy: userAtMultipleEstablishments.id
    },
    status: 'returned-to-applicant',
    ...generateDates(2)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'pil with licensing'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'with-licensing',
    ...generateDates(3)
  },
  {
    id: ids.task.project.grant,
    data: {
      data: {
        name: 'recalled ppl',
        version: uuid()
      },
      meta: {
        authority: 'yes'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'recalled-by-applicant',
    ...generateDates(4)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'discarded ppl'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'discarded-by-applicant',
    ...generateDates(5)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update with licensing'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-licensing',
    ...generateDates(6)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update with licensing - other establishment'
      },
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-licensing',
    ...generateDates(7)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update with inspector'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(8)
  },
  {
    id: ids.task.place.applied,
    data: {
      data: {
        name: 'place update recommended'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      id: ids.model.place.applied,
      changedBy: holc.id
    },
    status: 'inspector-recommended',
    ...generateDates(9)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update recommend rejected'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'inspector-rejected',
    ...generateDates(10)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'granted pil'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'resolved',
    ...generateDates(11)
  },
  {
    id: ids.task.place.resolved,
    data: {
      data: {
        name: 'granted place update'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      id: ids.model.place.resolved,
      changedBy: holc.id
    },
    status: 'resolved',
    ...generateDates(12)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'granted place update - other establishment'
      },
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'resolved',
    ...generateDates(13)
  },
  {
    id: ids.task.pil.rejected,
    data: {
      data: {
        name: 'rejected pil'
      },
      establishmentId: 100,
      subject: uuid(),
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.rejected,
      changedBy: holc.id
    },
    status: 'rejected',
    ...generateDates(14)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'profile update'
      },
      subject: user.id,
      model: 'profile',
      action: 'update',
      id: user.id,
      changedBy: user.id
    },
    status: 'autoresolved',
    ...generateDates(15)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'conditions update'
      },
      model: 'establishment',
      action: 'update-conditions',
      id: 100,
      changedBy: inspector.id
    },
    status: 'returned-to-applicant',
    ...generateDates(16)
  },
  // test for the case where the applicant is not
  // `changedBy` or `subject`
  {
    id: uuid(),
    data: {
      data: {
        name: 'Submitted by HOLC'
      },
      establishmentId: 100,
      changedBy: holc.id,
      // subject _should_ be the licenceHolderId, but in some cases is not.
      subject: holc.id,
      modelData: {
        licenceHolderId: user.id
      }
    },
    status: 'returned-to-applicant',
    ...generateDates(17)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'another with-inspectorate to test ordering'
      },
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(18)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'another with-licensing to test ordering'
      },
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-licensing',
    ...generateDates(19)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'another with-ntco to test ordering'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.applied,
      changedBy: user.id
    },
    status: 'with-ntco',
    ...generateDates(20)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'users cannot access tasks outside their associated establishments'
      },
      establishmentId: 101,
      subject: holc.id,
      model: 'pil',
      action: 'grant',
      id: uuid(),
      changedBy: holc.id // changed by holc, but holc is not associated with est id 101
    },
    status: 'with-ntco',
    ...generateDates(21)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'holc with multiple establishments'
      },
      establishmentId: 102,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(21)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project awaiting endorsement'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      id: uuid(),
      changedBy: user.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(22)
  }
]);
