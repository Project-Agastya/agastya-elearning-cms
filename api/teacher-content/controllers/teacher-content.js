'use strict';
const { sanitizeEntity } = require('strapi-utils');
var flatten = require('flat')
var xlsx = require('xlsx');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async report(ctx) {
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var data = await strapi.services["teacher-content"].find()
        var new_wb = xlsx.utils.book_new();
        var teacherRecords = []
        var talukRecords = []
        var districtRecords = []
        var stateRecords = []
        let objectMaxLength = []; 
        for(let i=0;i<7;i++)
            objectMaxLength.push({wch:20})
        
        var talukContentGrouping = {}
        var districtContentGrouping = {}
        var stateContentGrouping = {}
        for( let record of data){
            var currRecord = {}
            currRecord["Teacher FullName"] = record["teacher"] ? record["teacher"]["fullname"] : ""
            currRecord["Teacher School"] = record["teacher"] ? record["teacher"]["schoolname"] : ""
            currRecord["Teacher Taluk"] = record["teacher"] ? record["teacher"]["taluk"] : ""
            currRecord["Teacher District"] = record["teacher"] ? record["teacher"]["district"] : ""
            currRecord["Teacher State"] = record["teacher"] ? record["teacher"]["state"] : ""
            currRecord["Content Name"] = record["content"] ? record["content"]["name"] : ""
            currRecord["Views"] = record["count"] ? record["count"] : 1 
            if(talukContentGrouping[currRecord["Teacher Taluk"] + "--" + currRecord["Content Name"]]){
                talukContentGrouping[currRecord["Teacher Taluk"] + "--" + currRecord["Content Name"]] += record["count"]  
            }
            else{
                talukContentGrouping[currRecord["Teacher Taluk"] + "--" +currRecord["Content Name"]] = record["count"]
            }
            if(districtContentGrouping[currRecord["Teacher District"] + "--" + currRecord["Content Name"]]){
                districtContentGrouping[currRecord["Teacher District"] + "--" + currRecord["Content Name"]] += record["count"]  
            }
            else{
                districtContentGrouping[currRecord["Teacher District"] + "--" +currRecord["Content Name"]] = record["count"]
            }
            if(stateContentGrouping[currRecord["Teacher State"] + "--" + currRecord["Content Name"]]){
                stateContentGrouping[currRecord["Teacher State"] + "--" + currRecord["Content Name"]] += record["count"]  
            }
            else{
                stateContentGrouping[currRecord["Teacher State"] + "--" +currRecord["Content Name"]] = record["count"]
            }
            teacherRecords.push(currRecord)            
        }

        for(var key in talukContentGrouping){
            var currRecord = {}
            currRecord["Taluk"] = key.split("--")[0]
            currRecord["Content Name"] = key.split("--")[1]
            currRecord["Views"] = talukContentGrouping[key]
            talukRecords.push(currRecord)
        }

        for(var key in districtContentGrouping){
            var currRecord = {}
            currRecord["District"] = key.split("--")[0]
            currRecord["Content Name"] = key.split("--")[1]
            currRecord["Views"] = districtContentGrouping[key]
            districtRecords.push(currRecord)
        }

        for(var key in stateContentGrouping){
            var currRecord = {}
            currRecord["District"] = key.split("--")[0]
            currRecord["Content Name"] = key.split("--")[1]
            currRecord["Views"] = stateContentGrouping[key]
            stateRecords.push(currRecord)
        }

        let teacherSheet = xlsx.utils.json_to_sheet(teacherRecords);
        //To Set Column Width
        teacherSheet['!cols']= objectMaxLength

        
        let talukSheet = xlsx.utils.json_to_sheet(talukRecords);
        talukSheet['!cols']= objectMaxLength
        
        let districtSheet = xlsx.utils.json_to_sheet(districtRecords);
        districtSheet['!cols']= objectMaxLength
        
        let stateSheet = xlsx.utils.json_to_sheet(stateRecords);
        stateSheet['!cols']= objectMaxLength
        
        xlsx.utils.book_append_sheet( new_wb, teacherSheet, "Teacher Report" );
        xlsx.utils.book_append_sheet( new_wb, talukSheet, "Taluk Report" );
        xlsx.utils.book_append_sheet( new_wb, districtSheet, "District Report" );
        xlsx.utils.book_append_sheet( new_wb, stateSheet, "State Report" );
        var buffer = xlsx.write(new_wb, {type:'buffer', bookType:'xlsx'});
        
        ctx.attachment("report-" + date + ".xlsx");
        ctx.body = buffer;
    },

    async create(ctx) {
        let entity;
        let entityResp;
        entity = await strapi.services["teacher-content"].findOne(ctx.request.body);
        if(entity){
            entity["count"] = entity["count"] + 1 
            let id = entity["id"]
            entityResp = await strapi.services["teacher-content"].update({ id }, entity)
        }
        else{
            entityResp = await strapi.services["teacher-content"].create(ctx.request.body)
        }
        
        return sanitizeEntity(entityResp, { model: strapi.models["teacher-content"] });
    },
};