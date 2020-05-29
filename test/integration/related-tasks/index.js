const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { holc, user, user101, userAtMultipleEstablishments, licensing } = require('../../data/profiles');
const ids = require('../../data/ids');
const assert = require('assert');
const assertTasks = require('../../helpers/assert-tasks');

describe('Related tasks', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  describe('Pagination', () => {
    const allTasks = [
      'pil returned',
      'pil with licensing',
      'place update with licensing',
      'place update with inspector',
      'place update recommended',
      'place update returned',
      'place update recommend rejected',
      'granted pil',
      'granted place update'
    ];

    it('can limit the number of rows returned', () => {
      this.workflow.setUser({ profile: holc });
      const expected = allTasks.slice(0, 3);

      return request(this.workflow)
        .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&limit=3`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('can paginate through the resultset', () => {
      this.workflow.setUser({ profile: holc });
      const expected = allTasks.slice(3, 6);

      return request(this.workflow)
        .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&limit=3&offset=3`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });
  });

  describe('Only open tasks', () => {
    it('can filter out resolved / rejected tasks', () => {
      this.workflow.setUser({ profile: holc });
      const expected = [
        'place update with licensing',
        'place update with inspector',
        'place update recommended',
        'place update returned',
        'place update recommend rejected'
        // 'granted place update' this task should be filtered out
      ];

      return request(this.workflow)
        .get('/related-tasks?model=establishment&modelId=100&onlyOpen=true&limit=10000')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });
  });

  describe('Establishment tasks', () => {

    describe('Establishment admin', () => {
      it('returns all establishment, place and role tasks associated with the current establishment', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'place update with licensing',
          'place update with inspector',
          'place update recommended',
          'place update returned',
          'place update recommend rejected',
          'granted place update',
          'granted establishment update',
          'granted nio role at croydon'
        ];

        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all establishment, place and role tasks associated with the current establishment', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'place update with licensing',
          'place update with inspector',
          'place update recommended',
          'place update returned',
          'place update recommend rejected',
          'granted place update',
          'granted establishment update',
          'granted nio role at croydon'
        ];

        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('throws an unauthorised error when trying to fetch establishment tasks', () => {
        this.workflow.setUser({ profile: user });
        return request(this.workflow)
          .get('/related-tasks?model=establishment&modelId=100&limit=10000')
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, 'you do not have permission to view related tasks for establishment 100');
          });
      });
    });

  });

  describe('Profile tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks for their own profile', () => {
        this.workflow.setUser({ profile: holc });
        const expected = ['profile update holc'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${holc.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other unscoped profiles', () => {
        this.workflow.setUser({ profile: holc });

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile ${user.id}`);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all tasks for the requested profile', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = ['profile update'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks for the requested profile at any establishment', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = ['profile update user101'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user101.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks for their own profile', () => {
        this.workflow.setUser({ profile: user });
        const expected = ['profile update'];

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for other profiles', () => {
        this.workflow.setUser({ profile: user });

        return request(this.workflow)
          .get(`/related-tasks?model=profile&modelId=${user101.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile ${user101.id}`);
          });
      });
    });

  });

  describe('All tasks the profile has interacted with', () => {

    describe('Establishment admin', () => {
      it('returns all tasks their own profile has interacted with', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'pil returned',
          'pil with licensing',
          'place update with licensing',
          'place update with inspector',
          'place update returned',
          'place update recommended',
          'place update recommend rejected',
          'granted pil',
          'granted place update',
          'rejected pil',
          'Submitted by HOLC',
          'ppl submitted by HOLC for user',
          'profile update holc',
          'holc pil with licensing',
          'holc owned project',
          'granted establishment update',
          'granted nio role at croydon'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${holc.id}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks a user interacted with at an establishment the admin is an admin at', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'project at Croydon',
          'granted nio role at croydon'
          // 'project at Marvell' should not appear
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an unauthorised error for establishments the user is not an admin at', () => {
        this.workflow.setUser({ profile: holc });

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&establishmentId=101&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile ${userAtMultipleEstablishments.id}`);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all tasks interacted with by the user at all establishments', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'pil transfer recalled',
          'project at Croydon',
          'granted nio role at croydon',
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks their own profile has interacted with', () => {
        this.workflow.setUser({ profile: userAtMultipleEstablishments });
        const expected = [
          'pil transfer recalled',
          'project at Croydon',
          'granted nio role at croydon',
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${userAtMultipleEstablishments.id}&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('throws an error when trying to fetch tasks for other profiles', () => {
        this.workflow.setUser({ profile: userAtMultipleEstablishments });

        return request(this.workflow)
          .get(`/related-tasks?model=profile-touched&modelId=${user.id}&limit=10000`)
          .expect(403)
          .expect(response => {
            assert.equal(response.body.message, `you do not have permission to view related tasks for profile ${user.id}`);
          });
      });
    });

  });

  describe('PIL tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks related to their own PIL', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'holc pil with licensing'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to another users PIL at their admin establishment', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'granted pil'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.active}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns zero results for PILs at non admin establishments', () => {
        this.workflow.setUser({ profile: holc });

        const expected = [
          // 'pil at marvell' this task should be hidden
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all tasks related to a PIL', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'holc pil with licensing'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to a PIL at any establishment', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'pil at marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks related to their own PIL', () => {
        const expected = [
          'granted pil'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.active}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {

            assertTasks(expected, response.body.data);
          });
      });

      it('returns zero results for other users PILs', () => {
        this.workflow.setUser({ profile: user });

        const expected = [
          // 'holc pil with licensing' this task should be hidden
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=pil&modelId=${ids.model.pil.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

  });

  describe('Project tasks', () => {

    describe('Establishment admin', () => {
      it('returns all tasks related to their own project', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'holc owned project'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to another users project at their admin establishment', () => {
        this.workflow.setUser({ profile: holc });
        const expected = [
          'recalled ppl',
          'ppl submitted by HOLC for user'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.grant}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns zero results for projects at non admin establishments', () => {
        this.workflow.setUser({ profile: holc });

        const expected = [
          // 'project at Marvell' this task should be hidden
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Asru user', () => {
      it('returns all tasks related to a project', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'holc owned project'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns all tasks related to a project at any establishment', () => {
        this.workflow.setUser({ profile: licensing });
        const expected = [
          'project at Marvell'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.marvell}&establishmentId=101&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

    describe('Basic user', () => {
      it('returns all tasks related to their own project', () => {
        this.workflow.setUser({ profile: user });
        const expected = [
          'recalled ppl',
          'ppl submitted by HOLC for user'
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.grant}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });

      it('returns zero results for other users projects', () => {
        this.workflow.setUser({ profile: user });
        const expected = [
          // 'holc owned project' this task should be hidden
        ];

        return request(this.workflow)
          .get(`/related-tasks?model=project&modelId=${ids.model.project.holc}&establishmentId=100&limit=10000`)
          .expect(200)
          .expect(response => {
            assertTasks(expected, response.body.data);
          });
      });
    });

  });

});
