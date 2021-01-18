const http = require('http');
var fs = require('fs')
let zserver = null;

function createZServer(){
    zserver = http.createServer((req, res) => {
        var url = req.url;
        if (url.indexOf('?') >= 0) {
          url = url.substring(0, url.indexOf('?'));
        }
        //console.log("req:", __dirname, url);
        fs.readFile(__dirname + url, function (err,data) {
            if (err) {
              console.log('404:', err, url);
              res.writeHead(404);
              res.end(JSON.stringify(err));
              return;
            }
            res.writeHead(200);
            res.end(data);
          });
      })
      zserver.listen(8080);
    //   console.log(`listen on ${DbUtil.getAppSetting("default_local_server_port", "4040")}`);
}
createZServer();