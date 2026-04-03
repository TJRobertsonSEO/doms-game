// server.js — Simple local web server for testing
// Run with: node server.js
// Then open: http://localhost:3000

var http = require("http");
var fs = require("fs");
var path = require("path");

var PORT = process.env.PORT || 3000;

// Map file extensions to content types
var mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon"
};

var server = http.createServer(function(request, response) {
    // Default to index.html
    var filePath = "." + request.url;
    if (filePath === "./") {
        filePath = "./index.html";
    }

    // Get the file extension to determine content type
    var ext = path.extname(filePath).toLowerCase();
    var contentType = mimeTypes[ext] || "application/octet-stream";

    // Read and serve the file
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if (error.code === "ENOENT") {
                response.writeHead(404);
                response.end("File not found: " + filePath);
            } else {
                response.writeHead(500);
                response.end("Server error: " + error.code);
            }
        } else {
            response.writeHead(200, { "Content-Type": contentType });
            response.end(content);
        }
    });
});

server.listen(PORT, function() {
    console.log("GETAWAY server running at http://localhost:" + PORT);
    console.log("Press Ctrl+C to stop");
});
