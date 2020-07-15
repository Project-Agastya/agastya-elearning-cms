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
      //entities = await strapi.services.course.find(ctx.query),['sections','sections.lessons','teachers','categories','image']);
      entities = await strapi.services.course.find(ctx.query,['image','teachers','categories']);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.course }));
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.course.findOne({ id },['sections','sections.lessons','sections.lessons.lessonContents','sections.lessons.lessonContents.content','teachers','categories','image']);
    return sanitizeEntity(entity, { model: strapi.models.course });
  },
};