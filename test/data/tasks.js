const uuid = require('uuid/v4');
const { user, user101, userAtMultipleEstablishments, holc, inspector, licensing, ntco, userWithActivePil, asruSuper } = require('./profiles');
const ids = require('./ids');
const moment = require('moment');

const generateDates = daysAgo => {
  const date = moment().subtract(daysAgo, 'days').toISOString();
  return {
    createdAt: date,
    updatedAt: date
  };
};

const tasks = [
  {
    id: uuid(),
    data: {
      data: {
        name: 'trainingPil with ntco'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'trainingPil',
      action: 'grant',
      id: ids.model.trainingPil.noPil,
      changedBy: user.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(3)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'trainingPil at different establishment',
        establishmentId: 100
      },
      initiatedByAsru: false,
      establishmentId: 101,
      subject: user.id,
      model: 'trainingPil',
      action: 'grant',
      id: ids.model.trainingPil.hasPil,
      changedBy: user.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(3)
  },
  {
    id: ids.task.pil.withNtco,
    data: {
      data: {
        name: 'pil with ntco'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.applied,
      changedBy: user.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(0)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'pil with ntco - other establishment'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      subject: uuid(),
      model: 'pil',
      action: 'grant',
      changedBy: uuid()
    },
    status: 'with-ntco', // legacy status
    ...generateDates(1)
  },
  {
    id: ids.task.pil.grant,
    data: {
      data: {
        name: 'pil returned',
        profileId: user.id
      },
      initiatedByAsru: false,
      establishmentId: 100,
      id: ids.model.pil.linfordChristie,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      id: ids.model.project.grant,
      data: {
        name: 'recalled ppl',
        version: ids.model.projectVersion.grant
      },
      meta: {
        authority: true,
        awerb: true
      },
      initiatedByAsru: false,
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
    id: ids.task.project.recalledTransfer,
    data: {
      id: ids.model.project.recalledTransfer,
      data: {
        name: 'recalled project transfer',
        version: uuid(),
        establishmentId: 101
      },
      meta: {
        authority: true
      },
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'transfer',
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-licensing',
    ...generateDates(6),
    assignedTo: licensing.id
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update with licensing - other establishment'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-licensing',
    ...generateDates(7)
  },
  {
    id: ids.task.assignedToLicensing,
    data: {
      data: {
        name: 'assigned to licensing'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-licensing',
    ...generateDates(7),
    assignedTo: licensing.id
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'with licensing assigned to superuser'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-licensing',
    ...generateDates(7),
    assignedTo: asruSuper.id
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update with inspector'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(8)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'assigned to inspector'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(8.5),
    assignedTo: inspector.id
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'with inspectorate assigned to superuser'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      model: 'place',
      action: 'update',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(8.5),
    assignedTo: asruSuper.id
  },
  {
    id: ids.task.place.applied,
    data: {
      data: {
        name: 'place update recommended'
      },
      initiatedByAsru: false,
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
    id: ids.task.place.returned,
    data: {
      data: {
        name: 'place update returned'
      },
      // initiatedByAsru: false, remove to test backwards compat
      establishmentId: 100,
      model: 'place',
      action: 'update',
      id: ids.model.place.returned,
      changedBy: holc.id
    },
    status: 'returned-to-applicant',
    ...generateDates(9.5)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'place update recommend rejected'
      },
      initiatedByAsru: false,
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
      id: ids.model.pil.active,
      data: {
        name: 'granted pil'
      },
      initiatedByAsru: false,
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
      initiatedByAsru: false,
      establishmentId: 100,
      model: 'place',
      modelData: {
        status: 'active'
      },
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
      initiatedByAsru: false,
      establishmentId: 101,
      model: 'place',
      modelData: {
        status: 'active'
      },
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
      subject: user.id,
      model: 'profile',
      action: 'update',
      id: user.id,
      changedBy: user.id
    },
    status: 'resolved',
    ...generateDates(15)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'establishment application'
      },
      initiatedByAsru: false,
      model: 'establishment',
      modelData: {
        status: 'inactive'
      },
      action: 'grant',
      id: 888,
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(16)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'establishment amendment'
      },
      initiatedByAsru: false,
      model: 'establishment',
      action: 'update',
      id: 100,
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(16)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'add named person',
        type: 'nvs',
        profileId: user.id
      },
      initiatedByAsru: false,
      model: 'role',
      action: 'create',
      id: 100,
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(16)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'remove named person',
        type: 'nvs',
        profileId: user.id
      },
      initiatedByAsru: false,
      model: 'role',
      action: 'delete',
      id: 100,
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(16)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'conditions update'
      },
      initiatedByAsru: true,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
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
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      id: uuid(),
      changedBy: user.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(22)
  },
  {
    id: ids.task.pil.asruinitiated,
    data: {
      data: {
        name: 'pil conditions recalled'
      },
      initiatedByAsru: true,
      establishmentId: 100,
      subject: user.id,
      model: 'pil',
      action: 'update-conditions',
      id: uuid(),
      changedBy: inspector.id
    },
    status: 'recalled-by-applicant',
    ...generateDates(23)
  },
  {
    id: ids.task.pil.withNtcoOwnPil,
    data: {
      data: {
        name: 'ntco pil with ntco'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: ntco.id,
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.applied,
      changedBy: ntco.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(24)
  },
  {
    id: ids.task.project.submittedByHolc,
    data: {
      id: ids.model.project.grant,
      data: {
        name: 'ppl submitted by HOLC for user',
        version: uuid()
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'with-inspectorate',
    ...generateDates(25)
  },
  {
    id: ids.task.project.continuation,
    data: {
      id: ids.model.project.continuation2,
      data: {
        version: ids.model.projectVersion.continuation2,
        name: 'ppl with continuation'
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: userWithActivePil.id,
      model: 'project',
      action: 'grant',
      changedBy: userWithActivePil.id
    },
    status: 'recalled-by-applicant',
    ...generateDates(25)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'profile update holc'
      },
      initiatedByAsru: false,
      subject: holc.id,
      model: 'profile',
      action: 'update',
      id: holc.id,
      changedBy: holc.id
    },
    status: 'resolved',
    ...generateDates(26)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'profile update user101'
      },
      initiatedByAsru: false,
      subject: user101.id,
      model: 'profile',
      action: 'update',
      id: user101.id,
      changedBy: user101.id
    },
    status: 'resolved',
    ...generateDates(27)
  },
  {
    id: uuid(),
    data: {
      id: uuid(),
      data: {
        name: 'project at Croydon'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: userAtMultipleEstablishments.id,
      model: 'project',
      action: 'grant',
      changedBy: userAtMultipleEstablishments.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(28)
  },
  {
    id: uuid(),
    data: {
      id: ids.model.project.marvell,
      data: {
        name: 'project at Marvell'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      subject: userAtMultipleEstablishments.id,
      model: 'project',
      action: 'grant',
      changedBy: userAtMultipleEstablishments.id
    },
    status: 'awaiting-endorsement',
    ...generateDates(29)
  },
  {
    id: uuid(),
    data: {
      id: ids.model.pil.holc,
      data: {
        name: 'holc pil with licensing'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: holc.id,
      model: 'pil',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'with-licensing',
    ...generateDates(30)
  },
  {
    id: uuid(),
    data: {
      id: ids.model.project.holc,
      data: {
        name: 'holc owned project'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      changedBy: holc.id,
      subject: holc.id,
      model: 'project',
      modelData: {
        licenceHolderId: holc.id
      }
    },
    status: 'returned-to-applicant',
    ...generateDates(31)
  },
  {
    id: uuid(),
    data: {
      id: ids.model.project.holc,
      data: {
        name: 'holc owned project autoresolved'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      changedBy: holc.id,
      subject: holc.id,
      model: 'project',
      modelData: {
        licenceHolderId: holc.id
      }
    },
    status: 'autoresolved',
    ...generateDates(31)
  },
  {
    id: uuid(),
    data: {
      id: 100,
      data: {
        name: 'granted establishment update'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      changedBy: holc.id,
      subject: holc.id,
      model: 'establishment',
      modelData: {
        status: 'active'
      }
    },
    status: 'resolved',
    ...generateDates(32)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'granted nio role at croydon',
        type: 'nio',
        profileId: userAtMultipleEstablishments.id,
        establishmentId: 100
      },
      initiatedByAsru: false,
      establishmentId: 100,
      changedBy: holc.id,
      subject: userAtMultipleEstablishments.id,
      model: 'role'
    },
    status: 'resolved',
    ...generateDates(33)
  },
  {
    id: uuid(),
    data: {
      id: ids.model.pil.marvell,
      data: {
        name: 'pil at marvell'
      },
      initiatedByAsru: false,
      establishmentId: 101,
      subject: user101.id,
      model: 'pil',
      action: 'grant',
      changedBy: user101.id
    },
    status: 'resolved',
    ...generateDates(34)
  },
  {
    id: ids.task.project.discardedByAsru,
    data: {
      data: {
        name: 'discarded by asru'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: holc.id,
      model: 'project',
      action: 'grant',
      changedBy: holc.id
    },
    status: 'discarded-by-asru',
    ...generateDates(34)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project amendment initiated by asru'
      },
      initiatedByAsru: true,
      establishmentId: 100,
      subject: holc.id,
      model: 'project',
      modelData: {
        status: 'active'
      },
      action: 'grant',
      changedBy: asruSuper.id
    },
    status: 'resolved',
    ...generateDates(35)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'legacy project amendment'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: holc.id,
      model: 'project',
      modelData: {
        status: 'active',
        schemaVersion: 0
      },
      action: 'grant',
      changedBy: holc.id
    },
    status: 'resolved',
    ...generateDates(36)
  },
  {
    id: ids.task.project.rejection,
    data: {
      data: {
        name: 'Project amendment rejection',
        version: ids.model.projectVersion.rejection
      },
      id: ids.model.project.rejection,
      initiatedByAsru: false,
      establishmentId: 100,
      subject: holc.id,
      model: 'project',
      modelData: {
        status: 'active',
        schemaVersion: 1
      },
      action: 'grant',
      changedBy: holc.id
    },
    status: 'rejected',
    ...generateDates(38)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'submitted rop',
        projectId: ids.model.project.revoke,
        establishmentId: 100
      },
      initiatedByAsru: true,
      establishmentId: 100,
      subject: user.id,
      model: 'rop',
      action: 'submit',
      changedBy: asruSuper.id
    },
    status: 'resolved',
    ...generateDates(1)
  },
  {
    id: ids.task.project.grantRa,
    data: {
      id: ids.model.project.grantRa,
      data: {
        name: 'retrospective assessment submitted',
        raVersion: uuid()
      },
      meta: {
        'ra-awerb-date': '2021-1-1'
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant-ra',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(1)
  },
  {
    id: ids.task.project.hasDeadline,
    data: {
      data: {
        name: 'project application has deadline'
      },
      modelData: {
        status: 'inactive'
      },
      deadline: {
        extended: '2020-08-17',
        standard: '2020-07-27',
        isExtended: false,
        isExtendable: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(1)
  },
  {
    id: ids.task.project.hasDeadlineReturned,
    data: {
      data: {
        name: 'project application has deadline but returned'
      },
      modelData: {
        status: 'inactive'
      },
      deadline: {
        extended: '2020-08-17',
        standard: '2020-07-27',
        isExtended: false,
        isExtendable: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'returned-to-applicant',
    ...generateDates(1)
  },
  {
    id: ids.task.project.hasDeadlineAmendment,
    data: {
      data: {
        name: 'project amendment has deadline'
      },
      modelData: {
        status: 'active',
        schemaVersion: 1
      },
      deadline: {
        extended: '2020-08-17',
        standard: '2020-07-27',
        isExtended: false,
        isExtendable: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(1)
  },
  {
    id: ids.task.project.hasDeadlineRA,
    data: {
      data: {
        name: 'project application has deadline but RA'
      },
      modelData: {
        status: 'inactive'
      },
      deadline: {
        extended: '2020-08-17',
        standard: '2020-07-27',
        isExtended: false,
        isExtendable: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant-ra',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(1)
  },
  {
    id: ids.task.project.transfer2,
    data: {
      id: ids.model.project.transfer2,
      data: {
        name: 'project transfer in progress',
        version: uuid(),
        establishmentId: 101
      },
      meta: {
        authority: 'yes'
      },
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      modelData: {
        status: 'active',
        schemaVersion: 1
      },
      action: 'transfer',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(1)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project amendment in progress',
        version: uuid()
      },
      id: uuid(),
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      modelData: {
        status: 'active',
        schemaVersion: 1
      },
      action: 'grant',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(38)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project revocation in progress',
        version: uuid()
      },
      id: uuid(),
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      modelData: {
        status: 'active'
      },
      action: 'revoke',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(38)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project continuation in progress',
        version: uuid()
      },
      continuation: [
        { id: uuid() }
      ],
      id: uuid(),
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant',
      changedBy: user.id
    },
    status: 'with-inspectorate',
    ...generateDates(38)
  },
  {
    id: uuid(),
    data: {
      data: {
        name: 'project change of licence holder in progress',
        licenceHolderId: uuid()
      },
      id: uuid(),
      initiatedByAsru: false,
      establishmentId: 100,
      subject: uuid(),
      model: 'project',
      modelData: {
        status: 'active',
        licenceHolderId: uuid()
      },
      action: 'update',
      changedBy: uuid()
    },
    status: 'with-inspectorate',
    ...generateDates(38)
  },
  {
    id: ids.task.project.refuseSubmitted,
    data: {
      id: ids.model.project.refused,
      data: {
        name: 'ppl application submitted',
        version: uuid()
      },
      modelData: {
        status: 'inactive'
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant'
    },
    status: 'with-inspectorate',
    ...generateDates(2)
  },
  {
    id: ids.task.project.refuseDeadlineFutureWithUser,
    data: {
      id: ids.model.project.refused,
      data: {
        name: 'ppl notified of intention to refuse - deadline not passed',
        version: uuid()
      },
      modelData: {
        status: 'inactive'
      },
      intentionToRefuse: {
        deadline: moment().add(1, 'day').format('YYYY-MM-DD'),
        markddown: 'This is the reason for refusal',
        inspectorId: inspector.id
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant'
    },
    status: 'returned-to-applicant',
    ...generateDates(27)
  },
  {
    id: ids.task.project.refuseDeadlinePassedWithUser,
    data: {
      id: ids.model.project.refused,
      data: {
        name: 'ppl notified of intention to refuse - deadline has passed',
        version: uuid()
      },
      modelData: {
        status: 'inactive'
      },
      intentionToRefuse: {
        deadline: moment().subtract(1, 'day').format('YYYY-MM-DD'),
        markddown: 'This is the reason for refusal',
        inspectorId: inspector.id
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant'
    },
    status: 'returned-to-applicant',
    ...generateDates(29)
  },
  {
    id: ids.task.project.refuseDeadlineFutureWithAsru,
    data: {
      id: ids.model.project.refused,
      data: {
        name: 'ppl notified of intention to refuse - resubmitted - deadline not passed',
        version: uuid()
      },
      modelData: {
        status: 'inactive'
      },
      intentionToRefuse: {
        deadline: moment().add(1, 'day').format('YYYY-MM-DD'),
        markddown: 'This is the reason for refusal',
        inspectorId: inspector.id
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant'
    },
    status: 'with-inspectorate',
    ...generateDates(27)
  },
  {
    id: ids.task.project.refuseDeadlinePassedWithAsru,
    data: {
      id: ids.model.project.refused,
      data: {
        name: 'ppl notified of intention to refuse - resubmitted - deadline has passed',
        version: uuid()
      },
      modelData: {
        status: 'inactive'
      },
      intentionToRefuse: {
        deadline: moment().subtract(1, 'day').format('YYYY-MM-DD'),
        markddown: 'This is the reason for refusal',
        inspectorId: inspector.id
      },
      meta: {
        authority: true
      },
      initiatedByAsru: false,
      establishmentId: 100,
      subject: user.id,
      model: 'project',
      action: 'grant'
    },
    status: 'with-inspectorate',
    ...generateDates(29)
  }
];

module.exports = tasks;
