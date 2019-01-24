module.exports = {
  user: {
    id: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
    establishments: [ { id: 100 } ],
    roles: []
  },
  holc: {
    id: '143e500a-d42d-4010-840e-35418660cdc2',
    establishments: [ { id: 100, role: 'admin' } ],
    roles: []
  },
  ntco: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0',
    establishments: [ { id: 100 } ],
    roles: [ { type: 'ntco', establishmentId: 100 } ]
  },
  inspector: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d1',
    establishments: [],
    roles: [],
    asruUser: true,
    asruInspector: true
  },
  licensing: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d2',
    establishments: [],
    roles: [],
    asruUser: true,
    asruLicensing: true
  }
};
