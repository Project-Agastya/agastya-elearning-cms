'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOne(ctx) {
        const { id } = ctx.params;
        let entityResp;
        const entity = await strapi.services.content.findOne({ id });
        if(entity){
            entity["views"] = entity["views"] + 1 
            let id = entity["id"]
            entityResp = await strapi.services.content.update({ id }, entity)
        }
        return entityResp;
    },
};