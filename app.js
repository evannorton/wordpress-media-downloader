const https = require("https");
const fs = require('fs');
const siteURL = require("./config").siteURL;
const mediaURL = `${siteURL}/wp-json/wp/v2/media`;

https.get(mediaURL, (res) => {

    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        let mediaList = JSON.parse(data);
        let outDir = "./out";
        if (!fs.existsSync(outDir)){
            fs.mkdirSync(outDir);
        }
        mediaList.forEach((media) => {
            let file = fs.createWriteStream(`out/${media.media_details.sizes.full.file}`);
            https.get(media.media_details.sizes.full.source_url, (res) => {
                res.pipe(file);
            });
        });
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});