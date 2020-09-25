'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOne(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.services['featured-sub-topics'].findOne({ id },['subTopics','subTopics.image','subTopics.topic','subTopics.topic.categories','subTopics.contents']);
        for (let subTopic of entity.subTopics){
            let languages = new Set() 
            for(let content of subTopic.contents){
                languages.add(content.language)
            }
            delete subTopic.contents
            subTopic['languages'] = JSON.parse(JSON.stringify(Array.from(languages.values())));
        }
        return entity;
    },

    async find(ctx) {
        const { id } = ctx.params;
        
        const entity = await strapi.services['featured-sub-topics'].find(ctx.query,['subTopics','subTopics.image','subTopics.topic','subTopics.topic.categories','subTopics.contents']);
        for (let subEntity of entity){
            for (let subTopic of subEntity.subTopics){
                let languages = new Set() 
                for(let content of subTopic.contents){
                    languages.add(content.language)
                }
                delete subTopic.contents
                subTopic['languages'] = JSON.parse(JSON.stringify(Array.from(languages.values())));
            }
        }
        return entity;
    },
    
};