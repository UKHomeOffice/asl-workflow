const uuid = require('uuid/v4');

module.exports = {
  user: { // Linford Christie
    id: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
    establishments: [ { id: 100 } ],
    roles: []
  },
  userWithActivePil: { // Noddy Holder
    id: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88',
    establishments: [ { id: 100 } ],
    roles: []
  },
  userWithActivePilAndNoDOB: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9',
    establishments: [ { id: 100 } ],
    roles: []
  },
  userAtMultipleEstablishments: { // Colin Jackson
    id: 'ae28fb31-d867-4371-9b4f-79019e71232f',
    establishments: [ { id: 100 }, { id: 101 } ],
    roles: []
  },
  holc: {
    id: '143e500a-d42d-4010-840e-35418660cdc2',
    establishments: [ { id: 100, role: 'admin' }, { id: 102, role: 'admin' } ],
    roles: []
  },
  holc101: {
    id: '143e500a-d42d-4010-840e-35418660cdc2',
    establishments: [ { id: 101, role: 'admin' } ],
    roles: []
  },
  holc103: {
    id: '2b05d5b6-c11a-4ebe-a05a-5e3cba8397fa',
    establishments: [ { id: 103, role: 'admin' } ],
    roles: []
  },
  ntco: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0',
    establishments: [ { id: 100 } ],
    roles: [ { type: 'ntco', establishmentId: 100 } ]
  },
  ntco101: {
    id: uuid(),
    establishments: [ { id: 101 } ],
    roles: [ { type: 'ntco', establishmentId: 101 } ]
  },
  inspector: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d1',
    establishments: [],
    roles: [],
    asru: [{ id: 101 }],
    asruUser: true,
    asruInspector: true
  },
  licensing: {
    id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d2',
    establishments: [],
    roles: [],
    asru: [{ id: 101 }],
    asruUser: true,
    asruLicensing: true
  },
  asruAdmin: {
    id: 'a8e6f04b-f3a6-4378-91fa-f612d4ed1102',
    establishments: [],
    roles: [],
    asruUser: true,
    asruAdmin: true,
    asruLicensing: true,
    asruInspector: true
  }
};
