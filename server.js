const fs = require("fs/promises");
const WebSocketServer = require("ws").WebSocketServer;
const wss = new WebSocketServer({port:8082});
console.log("Server's up and running");
wss.on('connection',function(ws,req) {
	if(!req.headers['sec-websocket-protocol']) {
		ws.send("PROTOCOL ERR");
		ws.close();
		return;
	}
	if(req.headers['sec-websocket-protocol'].toLowerCase().split(" ").indexOf("lba2lvls") == -1) {
		ws.send("PROTOCOL ERR");
		ws.close();
		return;
	}
	console.log("Connection: " + req.socket.remoteAddress);
	ws.on('message',async function(d) {
		var data = d.toString().trim();
		//console.log(data);
		switch(data.split(" ")[0]) {
			case "GET":
				try {
					ws.send("GET OK\n"+await fs.readFile(".\\lvls\\"+data.split(" ")[1]+".lvl"));
					disconnect(ws,req);
				} catch(e) {
					console.log(e);
					ws.send("GET ERR");
					disconnect(ws,req);
				}
			break;
			case "POST":
				try {
					let id = concatrandom(8);
					fs.writeFile(".\\lvls\\"+id+".lvl",data.split(" ")[1]);
					ws.send("POST OK\n"+id);
					disconnect(ws,req);
				} catch(e) {
					ws.send("POST ERR");
					disconnect(ws,req);
				}
			break;
			case "LIST":
				try {
					var list = "";
					for(var file of await fs.readdir(".\\lvls\\")) {
						list += file.substring(0,file.length-4)+";";
					}
					ws.send("LIST OK\n"+list.substring(0,list.length-1));
					disconnect(ws,req);
				} catch(e) {
					ws.send("LIST ERR");
					disconnect(ws,req);
				}
			break;
		}
	});
})

function concatrandom(count) {
	let b = "";
	for(let i = 0; i < count; i++) {
		b += Math.floor(Math.random() * 10).toString();
	}
	return b;
}

function disconnect(ws,req) { console.log("Disconnection: " + req.socket.remoteAddress); ws.close(); }