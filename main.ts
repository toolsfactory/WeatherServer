import * as http from "http"
import * as qs from "querystring"

function putUpdate(item : string, data: string) {
  var datastr = data.toString();
  var options = {
    hostname: '192.168.2.230',
    port: 8080,
    path: "/rest/items/Weather_Local_" + item + "/state",
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'content-length' : datastr.length
    }
  };
  var req = http.request(options, function(res: http.IncomingMessage) {
    //console.log("received " + res.statusCode + " for put to " + item);
  });
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  req.write(datastr);
  req.end();
  console.log("Sent value '" + data + "' to: " + options.path);
}

function translate(item : string, data: any) : string {
  var value = data;
  if(item== "windchillf" || item == "dewptf" || item == "tempf" || item == "indoortempf") {
    value = ((data - 32) * 5)/9;
  }
  else if(item == "baromin") {
    value = data * 33.864;
  }
  else if(item.indexOf("rainin")> -1) {
    value = data * 25.4;
  }
  else if(item.indexOf("mph") > -1) {  
    value = data * 1.609344;
  }
  return value;
}

const degNames = ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
function degrees2name(deg: number):string {
    var val = Math.floor((deg / 22.5) + 0.5);
    return degNames[(val % 16)];
}

var server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write('success');
  response.end();

  console.log("------- new request");
  var pos = request.url.indexOf("?");
  if  (pos == -1) return;
  var str = request.url.substr(pos+1);

  var parsed = qs.parse(str);
  for(var name in parsed) {
    if(name =="ID" || name =="PASSWORD" || name == "action") continue;
    var value = translate(name, parsed[name]);
    putUpdate(name, value);
    if(name == "winddir")
    {
      var dirname = degrees2name(parseInt(value));
      putUpdate("winddirname", dirname);
    }
  }
});

server.listen(8080);
console.log("Server is listening");