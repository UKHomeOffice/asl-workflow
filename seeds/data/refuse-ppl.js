const moment = require('moment-business-time');
const { bankHolidays } = require('@ukhomeoffice/asl-constants');
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = async makeTask => {
  const defaultOpts = {
    model: 'project',
    action: 'grant',
    meta: { authority: true, awerb: true, ready: true }
  };

  const inspectorId = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';

  const applicationSubmittedTask = async () => {
    const eventTime = moment().subtract(1, 'day');

    await makeTask({
      ...defaultOpts,
      id: 'e7295338-beb8-4b66-8bb6-2e65da0e0e3b',
      title: 'Refuse PPL: submitted',
      date: eventTime.toISOString()
    });
  };

  const applicationSubmittedWithNoLicenceHolderTask = async () => {
    const eventTime = moment().subtract(1, 'day');

    await makeTask({
      ...defaultOpts,
      excludeLicenceHolder: true,
      id: '482fa74c-56b2-40ca-9dca-6b00d174b5e4',
      title: 'Refuse PPL: submitted - No licenceHolder on task',
      date: eventTime.toISOString()
    });
  };

  const canResubmitTask = async () => {
    const eventTime = moment().subtract(1, 'day');

    const task = await makeTask({
      ...defaultOpts,
      id: 'e2265359-f8eb-4607-951b-c4cf3c213132',
      title: 'Refuse PPL: can resubmit',
      data: {
        intentionToRefuse: {
          deadline: moment(eventTime).add(28, 'days').format('YYYY-MM-DD'),
          markdown: 'My reason for refusing this project',
          inspectorId
        }
      },
      date: eventTime.toISOString()
    });

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'intention-to-refuse', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'returned-to-applicant', changedBy: inspectorId });
  };

  const deadlineFutureWithApplicantTask = async () => {
    const eventTime = moment().subtract(1, 'day');

    const task = await makeTask({
      ...defaultOpts,
      id: 'b75ff8d7-fee4-4436-8598-e70b7101f446',
      title: 'Refuse PPL: deadline future with applicant',
      data: {
        intentionToRefuse: {
          deadline: moment(eventTime).add(28, 'days').format('YYYY-MM-DD'),
          markdown: 'My reason for refusing this project',
          inspectorId
        }
      },
      date: eventTime.toISOString()
    });

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'intention-to-refuse', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'returned-to-applicant', changedBy: inspectorId });
  };

  const deadlineFutureWithAsruTask = async () => {
    const eventTime = moment().subtract(1, 'day');

    const task = await makeTask({
      ...defaultOpts,
      id: '3545e6a5-ed37-4f25-8cae-15367b295a77',
      title: 'Refuse PPL: deadline future with asru',
      data: {
        intentionToRefuse: {
          deadline: moment(eventTime).add(28, 'days').format('YYYY-MM-DD'),
          markdown: 'My reason for refusing this project',
          inspectorId
        }
      },
      date: eventTime.toISOString()
    });

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'intention-to-refuse', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'returned-to-applicant', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'with-inspectorate' });
  };

  const deadlinePassedWithApplicantTask = async ({uuid, title}) => {
    const eventTime = moment().subtract(30, 'days');

    const task = await makeTask({
      ...defaultOpts,
      id: uuid,
      title,
      data: {
        intentionToRefuse: {
          deadline: moment(eventTime).add(28, 'days').format('YYYY-MM-DD'),
          markdown: 'My reason for refusing this project',
          inspectorId
        }
      },
      date: eventTime.toISOString()
    });

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'intention-to-refuse', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'returned-to-applicant', changedBy: inspectorId });

    return {eventTime, task};
  };

  const deadlinePassedWithAsruTask = async ({uuid, title}) => {
    const {eventTime, task} = await deadlinePassedWithApplicantTask({uuid, title});

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'with-inspectorate' });
  };

  const refusedTask = async () => {
    const eventTime = moment().subtract(30, 'days');

    const task = await makeTask({
      ...defaultOpts,
      id: 'c0038b53-3417-4a6e-aeb0-6bc92969b3ac',
      title: 'Refuse PPL: refused',
      data: {
        intentionToRefuse: {
          deadline: moment(eventTime).add(28, 'days').format('YYYY-MM-DD'),
          markdown: 'My reason for refusing this project',
          inspectorId
        }
      },
      date: eventTime.toISOString()
    });

    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'intention-to-refuse', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'returned-to-applicant', changedBy: inspectorId });
    await task.activity(eventTime.add(1, 'second').toISOString(), { status: 'refused', changedBy: inspectorId });
  };

  await applicationSubmittedTask();
  await applicationSubmittedWithNoLicenceHolderTask();
  await canResubmitTask();
  await deadlineFutureWithApplicantTask();
  await deadlineFutureWithAsruTask();

  // Used by tests causing these two to be refused once tests are run
  await deadlinePassedWithApplicantTask({
    uuid: '92ff5870-fc92-4d71-bd14-e72f83e4dae7',
    title: 'Refuse PPL: deadline passed with applicant'
  });
  await deadlinePassedWithAsruTask({
    uuid: '23ab7fdc-cf39-4a50-8bbb-b1f817d06e29',
    title: 'Refuse PPL: deadline passed with asru'
  });

  // Two additional tasks that are not used by tests, left pending refusal for use by UCD team
  await deadlinePassedWithApplicantTask({
    uuid: '1b02489d-1583-4836-9ba7-925f8c062cc5',
    title: 'Intent to refuse PPL: deadline passed with applicant'
  });
  await deadlinePassedWithAsruTask({
    uuid: 'a8c7622f-f629-4685-baa5-e55c23cb223c',
    title: 'Intent to refuse PPL: deadline passed with asru'
  });

  await refusedTask();
};
