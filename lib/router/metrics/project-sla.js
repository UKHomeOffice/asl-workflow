const { ref } = require('objection');
const moment = require('moment-business-time');
const { withASRU, closed } = require('../../flow');
const completeAndCorrect = require('../../decorators/deadline/complete-and-correct');

module.exports = (Case, settings) => {

  const closedStatuses = closed();
  const asruStatuses = withASRU();

  const hasPassedDeadline = (task, since) => {
    const currentState = task.activityLog.reduce((state, activity) => {

      const status = activity.status;
      state.extended = state.extended || activity.extended;
      // if it's a submission to the inspector then make note of the date and mark task as with ASRU
      if (!state.withASRU && status === 'with-inspector' && completeAndCorrect(activity.meta)) {
        return {
          ...state,
          withASRU: true,
          submitted: activity.createdAt
        };
      }
      // if the task is being returned or closed then check if a deadline has passed
      if (state.withASRU && (closedStatuses.includes(status) || !asruStatuses.includes(status))) {
        const deadline = moment(state.submitted).addWorkingTime(state.extended ? 55 : 40, 'days');
        const hasPassed = deadline.isBefore(activity.createdAt);
        return {
          ...state,
          withASRU: false,
          deadline: hasPassed ? deadline : state.deadline,
          hasPassed: hasPassed || state.hasPassed
        };
      }
      return state;
    }, { withASRU: false, submitted: task.createdAt });

    // if the last activity left the project in an open submitted state then check if the deadline has passed
    if (currentState.withASRU) {
      const deadline = moment(currentState.submitted).addWorkingTime(currentState.extended ? 55 : 40, 'days');
      const hasPassed = deadline.isBefore(moment());
      currentState.deadline = hasPassed ? deadline : currentState.deadline;
      currentState.hasPassed = hasPassed || currentState.hasPassed;
    }

    return currentState.hasPassed && currentState.deadline.isAfter(since);
  };

  return since => {
    return Promise.resolve()
      .then(() => {
        return Case.query()
          .eager('[activityLog]')
          .modifyEager('[activityLog]', builder => {
            builder
              .select(
                'createdAt',
                ref('event:status').castText().as('status'),
                ref('event:data:extended').castBool().as('extended'),
                ref('event:data:meta').castJson().as('meta')
              )
              .orderBy('createdAt', 'asc');
          })
          // only PPL applications
          .whereJsonSupersetOf('data', {
            model: 'project',
            action: 'grant',
            modelData: { status: 'inactive' }
          })
          // only things that _might_ have a deadline in the relevant time period
          .where('created_at', '>', moment(since, 'YYYY-MM-DD').subtract(12, 'weeks').format('YYYY-MM-DD'));
      })
      .then(tasks => {
        return tasks.filter(task => hasPassedDeadline(task, since));
      })
      .then(tasks => tasks.length);
  };

};
