const { Client } = require('pg');
var request = require('request');
var XLSX = require('xlsx');

var worksheet_data = {}

var classMap = {};
var imageMap = {};
var topicMap = {};
var subTopicMap = {};
var contentMap = {};
// var serviceUrl = "http://localhost:1337/"
var serviceUrl = "https://agastya-elearning.herokuapp.com/";

// var workbook = XLSX.readFile('C:\\Users\\RahulG\\Desktop\\AgastyaData.xlsx');
// console.log(worksheet_data)

xlsxUrl = "https://agastya.blob.core.windows.net/agastya/AgastyaData.xlsx";

const client = new Client({
  connectionString: "postgres://uft044057r2rr9:p201a12c4870b605795d2a057ef1add451ccee7d85ae06526fe2dfbfbc41098fd@ec2-52-6-107-12.compute-1.amazonaws.com:5432/d2loulosej0fk",
  ssl: {
    rejectUnauthorized: false
  }
  // connectionString : "postgres://postgres:admin@localhost:27017/postgres",
  // ssl : false
});

client.connect();

request(xlsxUrl, {encoding: null}, function(err, res, data) {
	if(err || res.statusCode !== 200) return;

	/* data is a node Buffer that can be passed to XLSX.read */
  var workbook = XLSX.read(data, {type:'buffer'});
  // var workbook = XLSX.readFile('C:\\Users\\RahulG\\Desktop\\AgastyaData.xlsx');

  var sheet_name_list = workbook.SheetNames;
  sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var col = z.substring(0,1);
        var row = parseInt(z.substring(1));
        var value = worksheet[z].v;

        //store header names
        if(row == 1) {
            headers[col] = value;
            continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    data.shift();
    worksheet_data[y.toLowerCase()] = data
  });

  insertClasses();

});


// https://agastya-elearning-cms.herokuapp.com/categories

function asyncPostCall(url,jsonReq){
  return new Promise( resolve => {
    console.log(url) 
    console.log(jsonReq)
    request.post(
      url,
      {json : jsonReq},
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body);
              resolve(true)
              return;
          }
          else{
            console.error(body.message)
            resolve(false)
            // throw new Error(body.message)
          }
      }
    );
  })
}


function insertClasses(){
  var contents = worksheet_data['classes']
  // console.log(contents)
  url = serviceUrl + 'classes'
  console.log(contents)
  allPromises = []
  for(json of contents){
    allPromises.push(asyncPostCall(url,json))
  }
  Promise.all(allPromises)
  .catch( err => {
    console.error(err)
    client.end()
    throw new Error(err);
  })
  .then( () => {
    console.log("All Request Sucessfull")
  })
  .finally( () => {
    console.log("Finished With Contents")
    insertSubTopics();
  })
}

function insertContents(){
  var contents = worksheet_data['contents']
  // console.log(contents)
  console.log("Inside Function")
  client.query('select id,name from classes;')
  .then( (res) => {
    for (let row of res.rows) {
      classMap[row["name"].toLowerCase()] = row["id"];
    }
  })
  .catch( (error) => {
    console.error(error)
    client.end();
    throw new Error(error)
  })
  .finally(() => {
    console.log(classMap)
    for(contentJson of contents){
      if(contentJson['classes']){
        let classes = contentJson['classes'].toLowerCase().split(',')
        contentJson['classes'] = []
        for(className of classes){
          className = className.trim()
          if(classMap[className]){
            let classId = classMap[className]
            contentJson['classes'].push(classId)
          }
          else{
            console.error("Class does not exist with name " + className)
            client.end();
            throw new Error("Class does not exist with name " + className)
          } 
        }
      }
    }
    client.query('select id,name from sub_topics;')
    .then( (res) => {
      for (let row of res.rows) {
        subTopicMap[row["name"].toLowerCase()] = row["id"];
      }
    })
    .catch( (error) => {
      console.error(error)
      client.end();
      throw new Error(error)
    })
    .finally(() => {
      console.log(subTopicMap)
      url = serviceUrl + 'contents'
      for(contentJson of contents){
        let subTopicName = contentJson['subTopic'].toLowerCase()
        if(subTopicMap[subTopicName]){
          let subTopicId = subTopicMap[subTopicName]
          contentJson['subTopic'] = subTopicId
        }
        else{
          console.error("Sub-Topic does not exist with name " + subTopicName)
          client.end();
          throw new Error("Sub-Topic does not exist with name " + subTopicName)
        }
      }
      console.log(contents)
      allPromises = []
      for(json of contents){
        allPromises.push(asyncPostCall(url,json))
      }
      Promise.all(allPromises)
      .catch( err => {
        console.error(err)
        client.end()
        throw new Error(err);
      })
      .then( () => {
        console.log("All Request Sucessfull")
      })
      .finally( () => {
        console.log("Finished With Contents")
        insertTopics()
      } 
      )
    })
  })
}

function insertCategories(){
  var contents = worksheet_data['categories']
  // console.log(contents)
  console.log("Inside Categories")
  client.query('select id,name from topics;')
  .then( (res) => {
    for (let row of res.rows) {
      topicMap[row["name"].toLowerCase()] = row["id"];
    }
  })
  .catch( (error) => {
    console.error(error)
    client.end();
    throw new Error(error)
  })
  .finally(() => {
    console.log(imageMap)
    url = serviceUrl + 'categories'
    for(contentJson of contents){
      if(contentJson['topics']){
        let topics = contentJson['topics'].toLowerCase().split(',')
        contentJson['topics'] = []
        for(topicName of topics){
          topicName = topicName.trim()
          if(topicMap[topicName]){
            let topicId = topicMap[topicName]
            contentJson['topics'].push(topicId)
          }
          else{
            console.error("Topic does not exist with name " + topicName)
            client.end();
            throw new Error("Topic does not exist with name " + topicName)
          } 
        }
      }
      let imageName = contentJson['image'].toLowerCase()
      if(imageMap[imageName]){
        let imageNumber = imageMap[imageName]
        contentJson['image'] = []
        contentJson['image'].push(imageNumber)
      }
      else{
        console.log("Image does not exist with name " + imageName)
        client.end();
        throw new Error("Image does not exist with name " + imageName)
      }
    }
    console.log(contents)
    allPromises = []
    for(json of contents){
      allPromises.push(asyncPostCall(url,json))
    }
    Promise.all(allPromises)
    .catch( err => {
      console.log(err)
      client.end()
      throw new Error(err);
    })
    .then( () => {
      console.log("All Request Sucessfull")
    })
    .finally( () => {
      console.log("Finished With Categores")
      client.end()
    } 
    )
  })
}


function insertTopics(){
  var contents = worksheet_data['topics']
  url = serviceUrl + 'topics'
  console.log(subTopicMap)
  for(contentJson of contents){
    console.log(contentJson)
    if(contentJson['subTopics']){
      let subTopics = contentJson['subTopics'].toLowerCase().split(',')
      contentJson['subTopics'] = []
      console.log(subTopics)
      for(subTopicName of subTopics){
        subTopicName = subTopicName.trim()
        if(subTopicMap[subTopicName]){
          let subTopicId = subTopicMap[subTopicName]
          contentJson['subTopics'].push(subTopicId)
        }
        else{
          console.error("SubTopic does not exist with name " + subTopicName)
          client.end();
          throw new Error("SubTopic does not exist with name " + subTopicName)
        } 
      }
    }
  }
  console.log(contents)
  allPromises = []
  for(json of contents){
    allPromises.push(asyncPostCall(url,json))
  }
  Promise.all(allPromises)
  .catch( err => {
    console.log(err)
    client.end()
    throw new Error(err);
  })
  .then( () => {
    console.log("All Request Sucessfull")
  })
  .finally( () => {
    console.log("Finished With Topics")
    insertCategories();
  } 
  )
}

function insertSubTopics(){
  var contents = worksheet_data['subtopics']
  // console.log(contents)
  console.log("Inside Function")
  client.query('select id,name from upload_file;')
  .then( (res) => {
    for (let row of res.rows) {
      imageMap[row["name"].toLowerCase()] = row["id"];
    }
  })
  .catch( (error) => {
    console.log(error)
    client.end();
    throw new Error(error)
  })
  .finally(() => {
    console.log(imageMap)
    url = serviceUrl + 'sub-topics'
    for(contentJson of contents){
      let imageName = contentJson['image'].toLowerCase()
      if(imageMap[imageName]){
        let imageNumber = imageMap[imageName]
        contentJson['image'] = []
        contentJson['image'].push(imageNumber)
      }
      else{
        console.log("Image does not exist with name " + imageName)
        client.end();
        throw new Error("Image does not exist with name " + imageName)
      }
    }
    console.log(contents)
    allPromises = []
    for(json of contents){
      allPromises.push(asyncPostCall(url,json))
    }
    Promise.all(allPromises)
    .catch( err => {
      console.log(err)
      client.end()
      throw new Error(err);
    })
    .then( () => {
      console.log("All Request Sucessfull")
    })
    .finally( () => {
      console.log("Finished With Contents")
      insertContents();
    } 
    )
  })
}
