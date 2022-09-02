const moment = require('moment');
const ids = require('./ids');
const uuid = require('uuid/v4');
const { userAtMultipleEstablishments, ntco101, user, userWithActivePil, holc } = require('./profiles');

module.exports = models => {

  const { Establishment, Profile, PIL, Permission, Role, AsruEstablishment, TrainingCourse } = models;

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
          id: '1c4544a3-428d-4ded-9eac-73b7a455c230',
          title: 'Dr',
          firstName: 'Derek',
          lastName: 'Nacwo',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'd.nacwo@example.com',
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
          id: ntco101.id,
          title: 'Dr',
          firstName: 'Noddy',
          lastName: 'Ntco101',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'test4@example123.com',
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
          telephone: '01234567890',
          certificates: [
            {
              id: ids.model.certificate.colinJackson,
              modules: ['E1']
            }
          ]
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
          id: '2b05d5b6-c11a-4ebe-a05a-5e3cba8397fa',
          title: 'Mr',
          firstName: 'Hol',
          lastName: 'Key',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'holkey@example.com',
          telephone: '01234567890'
        },
        {
          id: '143e500a-d42d-4010-840e-35418660cdc2',
          title: 'Mr',
          firstName: 'Holc',
          lastName: '101',
          address: '1 Some Road',
          postcode: 'A1 1AA',
          email: 'holc101@example.com',
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
          asruAdmin: true
        },
        {
          id: '0f7404a6-4c94-4ada-b08d-3235825b1579',
          firstName: 'Asru',
          lastName: 'Super',
          email: 'asru-super@example.com',
          asruUser: true,
          asruAdmin: true,
          asruLicensing: true,
          asruInspector: true,
          asruSupport: true
        },
        {
          id: '6891fe52-fb55-4d81-a7f5-24046d590407',
          firstName: 'Asru',
          lastName: 'Support',
          email: 'asru-support@example.com',
          asruUser: true,
          asruSupport: true
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
                id: ids.model.place.deleted,
                site: 'Lunar House',
                name: 'Deleted room',
                suitability: ['SA'],
                holding: ['STH'],
                deleted: '2018-01-01T14:00:00Z'
              },
              {
                id: ids.model.place.withRoles,
                site: 'Lunar House',
                name: 'Has assigned roles',
                suitability: ['SA'],
                holding: ['STH']
              }
            ],
            projects: [
              {
                id: uuid(),
                title: 'Test project 1',
                licenceHolderId: holc.id,
                expiryDate: '2040-01-01T12:00:00Z',
                status: 'active',
                licenceNumber: 'abc123'
              },
              {
                id: uuid(),
                title: 'Test project 3',
                licenceHolderId: holc.id,
                expiryDate: '2010-01-01T12:00:00Z',
                status: 'active',
                licenceNumber: 'abc456'
              },
              {
                id: ids.model.project.updateIssueDate,
                title: 'Test project 4',
                licenceHolderId: holc.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'xyz123',
                status: 'active',
                version: [
                  {
                    id: '6cd77ff4-8de7-4b10-8d5c-e9bdbf65ccfb',
                    status: 'granted',
                    data: {
                      duration: { years: 5, months: 0 }
                    }
                  }
                ]
              },
              {
                id: ids.model.project.transfer,
                title: 'Test project 5',
                licenceHolderId: userAtMultipleEstablishments.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'xyz123',
                status: 'active',
                version: [
                  {
                    id: ids.model.projectVersion.transfer,
                    status: 'draft',
                    data: {
                      transferToEstablishment: 101
                    }
                  }
                ]
              },
              {
                id: ids.model.project.updateLicenceNumber,
                title: 'Test project 6',
                licenceHolderId: userAtMultipleEstablishments.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'xyz123',
                status: 'active',
                version: [
                  {
                    id: uuid(),
                    status: 'granted',
                    data: {
                      duration: { years: 5, months: 0 }
                    }
                  }
                ]
              },
              {
                id: ids.model.project.updateStubLicenceHolder,
                title: 'Test project 7',
                licenceHolderId: userAtMultipleEstablishments.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'xyz123',
                isLegacyStub: true,
                status: 'active',
                version: [
                  {
                    id: uuid(),
                    status: 'granted',
                    data: {
                      duration: { years: 5, months: 0 }
                    }
                  }
                ]
              },
              {
                id: ids.model.project.recalledTransfer,
                title: 'Test project 8',
                licenceHolderId: userAtMultipleEstablishments.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: '70/1234',
                status: 'active',
                version: [
                  {
                    id: ids.model.projectVersion.recalledTransfer,
                    status: 'draft'
                  }
                ]
              },
              {
                id: ids.model.project.grant,
                title: 'Test project 9',
                licenceHolderId: holc.id,
                status: 'inactive',
                version: [
                  {
                    id: ids.model.projectVersion.grant,
                    status: 'draft'
                  },
                  {
                    id: ids.model.projectVersion.grant2,
                    status: 'draft'
                  }
                ]
              },
              {
                id: ids.model.project.amend,
                title: 'Test project 9',
                licenceHolderId: holc.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: '70/1235',
                status: 'active',
                version: [
                  {
                    id: ids.model.projectVersion.amend,
                    status: 'draft'
                  },
                  {
                    id: ids.model.projectVersion.amend2,
                    status: 'granted'
                  }
                ]
              },
              {
                id: ids.model.project.rejection,
                title: 'Test project for rejection',
                licenceHolderId: holc.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: '70/1235',
                status: 'active',
                version: [
                  {
                    id: ids.model.projectVersion.rejection,
                    status: 'submitted'
                  },
                  {
                    id: ids.model.projectVersion.rejection2,
                    status: 'granted'
                  }
                ]
              },
              {
                id: ids.model.project.revoke,
                title: 'Test revocation project',
                licenceHolderId: holc.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: '70/1235',
                status: 'active',
                version: [
                  {
                    id: uuid(),
                    status: 'granted'
                  }
                ],
                rops: [
                  {
                    id: ids.model.rop.submitted,
                    status: 'submitted',
                    year: 2020,
                    submittedDate: '2020-01-01T12:00:00Z'
                  },
                  {
                    id: ids.model.rop.draft,
                    status: 'draft',
                    year: 2021
                  }
                ]
              },
              {
                id: ids.model.project.continuation,
                title: 'Test project 9',
                licenceHolderId: user.id,
                status: 'inactive',
                version: [
                  {
                    id: ids.model.projectVersion.continuation,
                    status: 'draft',
                    data: {
                      'transfer-expiring': true,
                      'project-continuation': [
                        {
                          'licence-number': '70/1234',
                          'expiry-date': '2022-02-01'
                        }
                      ]
                    }
                  }
                ]
              },
              {
                id: ids.model.project.continuation2,
                title: 'Test project 10',
                licenceHolderId: userWithActivePil.id,
                status: 'inactive',
                version: [
                  {
                    id: ids.model.projectVersion.continuation2,
                    status: 'draft',
                    data: {
                      'transfer-expiring': true,
                      'project-continuation': [
                        {
                          'licence-number': '30/1234',
                          'expiry-date': '2021-02-01'
                        }
                      ]
                    }
                  }
                ]
              },
              {
                id: ids.model.project.notAContinuation,
                title: 'Test project 11',
                licenceHolderId: user.id,
                status: 'inactive',
                version: [
                  {
                    id: ids.model.projectVersion.notAContinuation,
                    status: 'draft',
                    data: {
                      'project-continuation': [
                        {
                          'licence-number': '70/1234',
                          'expiry-date': '2022-02-01'
                        }
                      ]
                    }
                  }
                ]
              },
              {
                id: ids.model.project.refused,
                title: 'Test project 12',
                licenceHolderId: user.id,
                status: 'inactive',
                version: [
                  {
                    id: uuid(),
                    status: 'draft'
                  }
                ]
              },
              {
                id: ids.model.project.suspend,
                title: 'Test project 13',
                licenceHolderId: userWithActivePil.id,
                issueDate: '2020-01-01T12:00:00Z',
                expiryDate: '2025-01-01T12:00:00Z',
                licenceNumber: 'SUS-1',
                status: 'active',
                version: [
                  {
                    id: uuid(),
                    status: 'granted'
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
            authorisations: [
              {
                type: 'killing',
                method: 'cuddles',
                description: 'A description'
              }
            ],
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
                id: ids.model.project.marvellTest,
                title: 'Test project 2',
                licenceHolderId: 'ae28fb31-d867-4371-9b4f-79019e71232e',
                expiryDate: '2040-01-01T12:00:00Z',
                status: 'active',
                licenceNumber: 'abc789'
              }
            ]
          },
          {
            id: 102,
            name: 'Research 102',
            status: 'inactive'
          },
          {
            id: 103,
            name: 'Tiny Pharma',
            status: 'active'
          }]);
        })
        .then(() => {
          return Permission.query().insert([
            { profileId: 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9', establishmentId: 100, role: 'basic' },
            { profileId: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88', establishmentId: 100, role: 'basic' },
            { profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9', establishmentId: 100, role: 'basic' },
            { profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0', establishmentId: 100, role: 'basic' },
            { profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f', establishmentId: 100, role: 'basic' },
            { profileId: '1c4544a3-428d-4ded-9eac-73b7a455c230', establishmentId: 100, role: 'basic' },

            { profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f', establishmentId: 101, role: 'basic' },
            { profileId: ntco101.id, establishmentId: 101, role: 'basic' },
            { profileId: 'ae28fb31-d867-4371-9b4f-79019e71232e', establishmentId: 101, role: 'basic' },
            { profileId: '143e500a-d42d-4010-840e-35418660cdc2', establishmentId: 101, role: 'basic' },

            { profileId: '2b05d5b6-c11a-4ebe-a05a-5e3cba8397fa', establishmentId: 103, role: 'basic' }
          ]).returning('*'); // permissions table has no id field so we need this otherwise it tries to return id
        })
        .then(() => {
          return Role.query().insertGraph([
            {
              id: uuid(),
              type: 'pelh',
              profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f',
              establishmentId: 100
            },
            {
              id: ids.model.role.nacwoClive,
              type: 'nacwo',
              profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d9',
              establishmentId: 100,
              places: [
                {
                  id: ids.model.place.withRoles
                }
              ]
            },
            {
              id: ids.model.role.nacwoDerek,
              type: 'nacwo',
              profileId: '1c4544a3-428d-4ded-9eac-73b7a455c230',
              establishmentId: 100
            },
            {
              id: uuid(),
              type: 'ntco',
              profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d0',
              establishmentId: 100
            },

            {
              id: uuid(),
              type: 'pelh',
              profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f',
              establishmentId: 101
            },
            {
              id: ids.model.role.holc,
              type: 'holc',
              profileId: '143e500a-d42d-4010-840e-35418660cdc2',
              establishmentId: 101
            },
            {
              id: uuid(),
              type: 'ntco',
              profileId: ntco101.id,
              establishmentId: 101
            },

            {
              id: uuid(),
              type: 'pelh',
              profileId: '2b05d5b6-c11a-4ebe-a05a-5e3cba8397fa',
              establishmentId: 103
            }
          ], { relate: true });
        })
        .then(() => {
          return TrainingCourse.query().insertGraph({
            id: ids.model.trainingCourse,
            species: ['Mice'],
            title: 'Test course',
            establishmentId: 101,
            projectId: ids.model.project.marvellTest,
            startDate: moment().add(3, 'months').format('YYYY-MM-DD'),
            trainingPils: [
              {
                id: ids.model.trainingPil.hasPil,
                profileId: userWithActivePil.id,
                status: 'inactive'
              },
              {
                id: ids.model.trainingPil.noPil,
                profileId: user.id,
                status: 'inactive'
              },
              {
                id: ids.model.trainingPil.active,
                profileId: userAtMultipleEstablishments.id,
                status: 'active'
              }
            ]
          });
        })
        .then(() => {
          return PIL.query().insertGraph([
            {
              id: ids.model.pil.linfordChristie,
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
              id: ids.model.pil.active,
              profileId: 'b2b8315b-82c0-4b2d-bc13-eb13e605ee88',
              establishmentId: 100,
              licenceNumber: 'D-457',
              procedures: ['D'],
              notesCatD: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              status: 'active'
            },
            {
              id: ids.model.pil.inactive,
              profileId: 'ae28fb31-d867-4371-9b4f-79019e71232f', //colin jackson
              establishmentId: 100,
              procedures: ['D'],
              notesCatD: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              status: 'inactive'
            },
            {
              id: ids.model.pil.transfer,
              profileId: userAtMultipleEstablishments.id,
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
    })
    .then(() => {
      // assign establishments to inspector and licensing user
      return AsruEstablishment.query().insert([
        { profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d1', establishmentId: 101 },
        { profileId: 'a942ffc7-e7ca-4d76-a001-0b5048a057d2', establishmentId: 101 }
      ]);
    });
};
