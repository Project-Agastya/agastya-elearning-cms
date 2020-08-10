'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.services['featured-sub-topics'].findOne({ id },['subTopics','subTopics.topic','subTopics.topic.categories']);
        return sanitizeEntity(entity, { model: strapi.models['featured-sub-topics'] });
    },
};