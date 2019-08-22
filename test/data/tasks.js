const uuid = require('uuid/v4');
const { user, holc, inspector } = require('./profiles');
const ids = require('./ids');

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
      id: ids.pil.applied,
      changedBy: user.id
    },
    status: 'with-ntco'
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
    status: 'with-ntco'
  },
  {
    id: uuid(),
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
    status: 'returned-to-applicant'
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
    status: 'with-licensing'
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'recalled ppl'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'projects',
      action: 'grant',
      changedBy: user.id
    },
    status: 'recalled-by-applicant'
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'discarded ppl'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'projects',
      action: 'grant',
      changedBy: user.id
    },
    status: 'discarded-by-applicant'
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
    status: 'with-licensing'
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
    status: 'with-licensing'
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
    status: 'with-inspectorate'
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update recommended'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      id: ids.place.applied,
      changedBy: holc.id
    },
    status: 'inspector-recommended'
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
    status: 'inspector-rejected'
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
    status: 'resolved'
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'granted place update'
      },
      establishmentId: 100,
      model: 'place',
      action: 'update',
      id: ids.place.resolved,
      changedBy: holc.id
    },
    status: 'resolved'
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
    status: 'resolved'
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'rejected pil'
      },
      establishmentId: 100,
      subject: uuid(),
      model: 'pil',
      action: 'grant',
      id: ids.pil.rejected,
      changedBy: holc.id
    },
    status: 'rejected'
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
    status: 'autoresolved'
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
    status: 'returned-to-applicant'
  }
]);
