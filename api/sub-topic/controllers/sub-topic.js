'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOne(ctx) {
        const { id } = ctx.params;
        const normalContentAudience = "bothteacherstudent"
        const exclusiveContent = "teacherexclusive"
        let entityResp;
        const entity = await strapi.services['sub-topic'].findOne({ id },['topic','contents','contents.classes','image']);
        if(entity){
            let anyExclusiveContent = false
            let anyNormalContent = false
            for(let content of entity.contents){
                let audience = content.audience.toLowerCase()
                if(normalContentAudience.includes(audience))
                    anyNormalContent = true 
                if(exclusiveContent === audience)
                    anyExclusiveContent = true
            }
            entity["anyNormalContent"] = anyNormalContent
            entity["anyExclusiveContent"] = anyExclusiveContent   
            entity["views"] = entity["views"] + 1 
            let id = entity["id"]
            entityResp = await strapi.services['sub-topic'].update({ id }, entity)
        }
        return entity;
    },

    async find(ctx) {
        const { id } = ctx.params;
        const normalContentAudience = "bothteacherstudent"
        const exclusiveContent = "teacherexclusive"
        let entityResp;
        const entity = await strapi.services['sub-topic'].find(ctx.query,['topic','topic.categories','contents','contents.classes','image']);
        if(entity){
            for(let subTopic of entity){
                let anyExclusiveContent = false
                let anyNormalContent = false
                let languages = new Set()
                for(let content of subTopic.contents){
                    languages.add(content.language)
                    let audience = content.audience.toLowerCase()
                    if(normalContentAudience.includes(audience))
                        anyNormalContent = true 
                    if(exclusiveContent === audience)
                        anyExclusiveContent = true
                }
                subTopic["anyNormalContent"] = anyNormalContent
                subTopic["anyExclusiveContent"] = anyExclusiveContent
                subTopic['languages'] = JSON.parse(JSON.stringify(Array.from(languages.values())));
                delete subTopic["contents"]
            }   
        }
        return entity;
    },
};