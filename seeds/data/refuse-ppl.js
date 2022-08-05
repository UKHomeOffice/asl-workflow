const moment = require('moment-business-time');
const { bankHolidays } = require('@asl/constants');
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

  const deadlinePassedWithApplicantTask = async () => {
    const eventTime = moment().subtract(30, 'days');

    const task = await makeTask({
      ...defaultOpts,
      id: '92ff5870-fc92-4d71-bd14-e72f83e4dae7',
      title: 'Refuse PPL: deadline passed with applicant',
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

  const deadlinePassedWithAsruTask = async () => {
    const eventTime = moment().subtract(30, 'days');

    const task = await makeTask({
      ...defaultOpts,
      id: '23ab7fdc-cf39-4a50-8bbb-b1f817d06e29',
      title: 'Refuse PPL: deadline passed with asru',
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
  await canResubmitTask();
  await deadlineFutureWithApplicantTask();
  await deadlineFutureWithAsruTask();
  await deadlinePassedWithApplicantTask();
  await deadlinePassedWithAsruTask();
  await refusedTask();
};
