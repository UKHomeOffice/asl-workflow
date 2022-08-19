const { raw } = require('objection');

module.exports = query => {
  return query
    .select('cases.*')
    .select(raw(`
      CASE
        WHEN (cases.data->'deadline'->>'isExtended')::boolean = true THEN
          CASE
            WHEN (cases.data->'internalDeadline'->>'extended')::date >= current_date THEN cases.data->'internalDeadline'->>'extended'
            WHEN (cases.data->'internalDeadline'->>'extended')::date < current_date AND NOT(cases.data \\? 'deadline') THEN cases.data->'internalDeadline'->>'extended'
            WHEN cases.data \\? 'deadline' THEN cases.data->'deadline'->>'extended'
            ELSE NULL
          END
        ELSE
          CASE
            WHEN (cases.data->'internalDeadline'->>'standard')::date >= current_date THEN cases.data->'internalDeadline'->>'standard'
            WHEN (cases.data->'internalDeadline'->>'standard')::date < current_date AND NOT(cases.data \\? 'deadline') THEN cases.data->'internalDeadline'->>'standard'
            WHEN cases.data \\? 'deadline' THEN cases.data->'deadline'->>'standard'
            ELSE NULL
          END
      END AS active_deadline
    `));
};
