module.exports = async makeTask => {
  const task = await makeTask({
    id: '782732c5-4457-46d6-9d46-6610a0ecf872',
    model: 'project',
    action: 'grant',
    date: '2022-01-07'
  });

  await task.activity('2022-01-12', { status: 'returned-to-applicant' });
  await task.activity('2022-01-14', { status: 'awaiting-endorsement' });
  await task.activity('2022-01-14', { status: 'with-inspectorate' });
  await task.activity('2022-01-18', { status: 'returned-to-applicant' });
  await task.activity('2022-01-24', { status: 'with-inspectorate' });
  await task.activity('2022-01-28', { status: 'returned-to-applicant' });
  await task.activity('2022-01-30', { status: 'with-inspectorate' });
};
