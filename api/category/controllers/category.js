'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
      const normalContentAudience = "bothteacherstudent"
      const exclusiveContent = "teacherexclusive"
        let entities;
        if (ctx.query._q) {
          entities = await strapi.services.category.search(ctx.query);
        } else {
          entities = await strapi.services.category.find(ctx.query,['image','topics','topics.subTopics','topics.subTopics.contents']);
          for(let category of entities){
            for (let topic of category.topics){
              for (let subTopic of topic.subTopics){
                  let anyExclusiveContent = false
                  let anyNormalContent = false
                  for(let content of subTopic.contents){
                      let audience = content.audience.toLowerCase()
                      if(normalContentAudience.includes(audience))
                          anyNormalContent = true 
                      if(exclusiveContent === audience)
                          anyExclusiveContent = true
                  }    
                  subTopic["anyNormalContent"] = anyNormalContent
                  subTopic["anyExclusiveContent"] = anyExclusiveContent
                  delete subTopic.contents
              }
            }
          }
        }
    
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.category }));
      }
};
