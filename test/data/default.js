const ids = require('./ids');

module.exports = models => {

  const { Establishment, Profile, PIL } = models;

  return Promise.resolve()
    .then(() => {
      return Profile.query().insertGraph([
        {
          id: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
          userId: 'abc123',
          title: 'Dr',
          firstName: 'Linford',
          lastName: 'Christie',
          dob: '1960-04-02',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test1@example.com',
          telephone: '01234567890',
          certificates: [
            {
              id: 'c3032cc0-7dc7-40bc-be7e-97edc4ea1072'
            }
          ]
        },
        {
          id: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88',
          userId: 'basic',
          title: 'Dr',
          firstName: 'Noddy',
          lastName: 'Holder',
          dob: '1946-06-15',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test2@example.com',
          telephone: '01234567890'
        },
        {
          id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9',
          title: 'Dr',
          firstName: 'Clive',
          lastName: 'Nacwo',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test3@example.com',
          telephone: '01234567890'
        },
        {
          id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0',
          title: 'Dr',
          firstName: 'Noddy',
          lastName: 'Ntco',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test4@example.com',
          telephone: '01234567890'
        },
        {
          id: 'ae28fb31-d867-4371-9b4f-79019e71232f',
          title: 'Professor',
          firstName: 'Colin',
          lastName: 'Jackson',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test5@example.com',
          telephone: '01234567890'
        },
        {
          id: 'ae28fb31-d867-4371-9b4f-79019e71232e',
          title: 'Mr',
          firstName: 'Vincent',
          lastName: 'Malloy',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'vincent@malloy.com',
          telephone: '01234567890'
        },
        {
          id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d1',
          firstName: 'Inspector',
          lastName: 'Morse',
          email: 'inspector-morse@example.com',
          asruUser: true,
          asruInspector: true
        },
        {
          id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d2',
          firstName: 'Li Sen',
          lastName: 'Xing',
          email: 'lisenxing@example.com',
          asruUser: true,
          asruLicensing: true
        },
        {
          id: 'a8e6f04b-f3a6-4378-91fa-f612d4ed1102',
          firstName: 'Asru',
          lastName: 'Admin',
          email: 'asruadmin@example.com',
          asruUser: true,
          asruAdmin: true,
          asruLicensing: true,
          asruInspector: true
        }
      ])
        .then(() => {
          return Establishment.query().insertGraph([{
            id: 100,
            name: 'University of Croydon',
            country: 'england',
            address: '100 High Street',
            email: 'test@example.com',
            places: [
              {
                id: ids.model.place.applied,
                site: 'Lunar House',
                name: 'Room 101',
                suitability: ['SA', 'LA'],
                holding: ['LTH']
              },
              {
                id: ids.model.place.resolved,
                site: 'Lunar House',
                name: 'Room 102',
                suitability: ['SA'],
                holding: ['STH']
              },
              {
                id: 'a50331bb-c1d0-4068-87ca-b5a41143b0d0',
                site: 'Lunar House',
                name: 'Deleted room',
                suitability: ['SA'],
                holding: ['STH'],
                deleted: '2018-01-01T14:00:00Z'
              }
            ],
            projects: [
              {
                title: 'Test project 1',
                licenceHolderId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
                expiryDate: '2040-01-01T12:00:00Z',
                licenceNumber: 'abc123'
              },
              {
                title: 'Test project 3',
                licenceHolderId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
                expiryDate: '2010-01-01T12:00:00Z',
                licenceNumber: 'abc456'
              },
              {
                title: 'Test project 4',
                licenceHolderId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'xyz123',
                version: [
                  {
                    id: '6cd77ff4-8de7-4b10-8d5c-e9bdbf65ccfb',
                    status: 'granted',
                    data: {
                      duration: { years: 5, months: 0 }
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 101,
            name: 'Marvell Pharmaceuticals',
            country: 'england',
            address: '101 High Street',
            email: 'test@example.com',
            places: [
              {
                id: 'e859d43a-e8ab-4ae6-844a-95c978082a48',
                site: 'Apollo House',
                name: 'Room 101',
                suitability: ['SA'],
                holding: ['LTH']
              },
              {
                id: '4c9f9921-92ad-465c-8f94-06f05fcb7736',
                site: 'Apollo House',
                name: 'Room 102',
                suitability: ['SA'],
                holding: ['STH']
              }
            ],
            projects: [
              {
                title: 'Test project 2',
                licenceHolderId: 'ae28fb31-d867-4371-9b4f-79019e71232e',
                expiryDate: '2040-01-01T12:00:00Z',
                licenceNumber: 'abc789'
              }
            ]
          },
          {
            id: 102,
            name: 'Research 102',
            status: 'inactive'
          }]);
        })
        .then(() => {
          return Establishment.query().upsertGraph([{
            id: 100,
            profiles: [
              { id: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9' },
              { id: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88' },
              { id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9' },
              { id: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0' },
              { id: 'ae28fb31-d867-4371-9b4f-79019e71232f' }
            ],
            roles: [
              {
                type: 'pelh',
                profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f'
              },
              {
                type: 'nacwo',
                profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9'
              },
              {
                type: 'ntco',
                profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0'
              }
            ]
          },
          {
            id: 101,
            profiles: [
              { id: 'ae28fb31-d867-4371-9b4f-79019e71232f' },
              { id: 'ae28fb31-d867-4371-9b4f-79019e71232e' }
            ],
            roles: [
              {
                type: 'pelh',
                profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f'
              }
            ]
          }], { relate: true });
        })
        .then(() => {
          return PIL.query().insertGraph([
            {
              id: '9fbe0218-995d-47d3-88e7-641fc046d7d1',
              profileId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9',
              establishmentId: 100,
              licenceNumber: 'AB-123',
              procedures: ['A', 'B']
            },
            {
              id: '247912b2-e5c6-487d-b717-f8136491f7b8',
              profileId: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88',
              establishmentId: 100,
              licenceNumber: 'D-456',
              procedures: ['D'],
              notesCatD: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              status: 'active'
            },
            {
              id: 'ba3f4fdf-27e4-461e-a251-3188faa35df5',
              profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9',
              establishmentId: 100,
              licenceNumber: 'F-789',
              procedures: ['F'],
              notesCatF: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
            },
            {
              id: '117298fa-f98f-4a98-992d-d29b60703866',
              profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f', // Colin is at both establishments
              establishmentId: 100,
              licenceNumber: 'C-987',
              procedures: ['C'],
              species: ['Mice', 'Rats']
            }
          ]);
        });
    });
};
