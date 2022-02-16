const schema = require('@asl/schema');
const { v4: uuid } = require('uuid');
const config = require('../../config');
module.exports = knex => async (opts = {}) => {

  const { Project, ProjectVersion, Profile } = schema(config.db);

  if (opts.model === 'project') {

    const modelData = opts.licenceNumber
      ? await Project.query().findOne({ licenceNumber: opts.licenceNumber })
      : await Project.query().findById(opts.id);

    const version = await ProjectVersion.query()
      .select('id')
      .where({ projectId: modelData.id, status: 'submitted' })
      .orderBy('updatedAt', 'desc')
      .first();
    const changedBy = opts.changedBy || modelData.licenceHolderId;

    const id = uuid();
    const status = opts.status || 'with-inspectorate';
    const profile = await Profile.query().findById(changedBy).withGraphFetched('establishments');

    const task = {
      id,
      status,
      data: {
        ...opts.data,
        model: 'project',
        action: opts.action || 'grant',
        id: modelData.id,
        data: {
          version: version.id,
          licenceHolderId: modelData.licenceHolderId,
          establishmentId: modelData.establishmentId
        },
        meta: opts.meta || {},
        subject: modelData.licenceHolderId,
        establishmentId: modelData.establishmentId,
        changedBy,
        modelData
      }
    };

    const activity = [
      {
        id: uuid(),
        case_id: id,
        event_name: `status:new:${status}`,
        changed_by: profile.id,
        event: {
          id: uuid,
          data: task,
          event: `status:new:${status}`,
          status,
          meta: {
            user: {
              profile
            }
          }
        }
      }
    ];

    await knex('cases').insert(task);
    await knex('activity_log').insert(activity);
    return;

  }

  throw new Error(`Unsupported model: ${opts.model}`);

};
