
function getHTTP(url) {
  return new Promise(function(resolve, reject) {
    const https = require('https');

    https.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        res.resume();
        resolve();
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {

          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  });
}

function getTopIds(numOfNews) {
  const topIds = getHTTP("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty").then(function(val) {
    getNews(val, numOfNews);
  });
  return topIds;
}


function getNews(idList, numOfNews) {

  const idListFinal = idList.slice(0, numOfNews);
  const jsonFinal = [];

  var jsonFinalLoop = function(x) {
    if(x < numOfNews) {
      const tempJson = {}
      const v = getHTTP("https://hacker-news.firebaseio.com/v0/item/" + idListFinal[x] + ".json?print=pretty").then(function(val) {
        const httpJson = val;  
        tempJson["title"] = httpJson["title"];
        tempJson["uri"] = httpJson["url"];
        tempJson["author"] = httpJson["by"];
        tempJson["points"] = httpJson["score"];
        tempJson["rank"] = x + 1;

        jsonFinal.push(tempJson);
        jsonFinalLoop(x + 1);
      });
    } else {
      console.log("");
      console.log(jsonFinal);
    }
  };
  jsonFinalLoop(0);
}


var stdin = process.openStdin();
    
console.log('Just write "hackernews --posts n"  (--posts how many posts to print. A positive integer <= 100) or EXIT to exit')
  console.log("");

stdin.addListener("data", function(d) {
  var answer = d.toString().trim();
  var answerSplit = answer.split(" ");
  if (answer === "EXIT") {
    console.log("");
    console.log("Bye");
    stdin.destroy();
  } else if(answerSplit.length === 3) {
    if (answerSplit[0] === "hackernews" && parseInt(answerSplit[1]) > 0 && parseInt(answerSplit[1]) <= 100 && answerSplit[2] === "n") {
      const topIds = getHTTP("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty").then(function(val) {
        const jsonFinal = getNews(val, 1);
      });
    } else {
      console.log("Wrong Answer. Try again.")
      console.log("");
    }
  } else {
    console.log("Wrong Answer. Try again.")
    console.log("");
  }
});
