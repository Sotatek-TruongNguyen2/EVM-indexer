const fs = require('fs');

function main() {
  setTimeout(() => console.log('1'));
  fs.readFile("./index.js", function() {
    console.log("Done");
  })
  setImmediate(() => console.log('2'));

}

main();
