'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOne(ctx) {
        const { id } = ctx.params;
        let entityResp;
        const entity = await strapi.services['sub-topic'].findOne({ id },['topic','contents','contents.classes','image']);
        if(entity){
            entity["views"] = entity["views"] + 1 
            let id = entity["id"]
            entityResp = await strapi.services['sub-topic'].update({ id }, entity)
        }
        return entity;
    },
};