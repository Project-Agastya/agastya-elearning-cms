const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.course.search(ctx.query);
    } else {
      entities = await strapi.services.course.find(ctx.query,['sections','sections.lessons']);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.course }));
  },
};