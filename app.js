const http = require("http");
const https = require("https");
const fs = require('fs');
const siteURL = require("./config").siteURL;
const mediaURL = `${siteURL}/wp-json/wp/v2/media`;
const protocol = siteURL.indexOf("https://") === 0 ? https : http;

function downloadMedia(key) {

    protocol.get(`${mediaURL}?page=${key}`, (res) => {

        let data = "";

        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            let parsedData = JSON.parse(data);
            if (parsedData.code) {
                console.log(parsedData);
            } else {
                let outDir = "./out";
                if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }
                parsedData.forEach((media) => {
                    let fileName = `${media.slug}${media.source_url.substring(media.source_url.lastIndexOf("."))}`;
                    console.log(fileName);
                    let file = fs.createWriteStream(`${outDir}/${fileName}`);
                    protocol.get(media.source_url, (res) => {
                        res.pipe(file);
                    });
                });
                setTimeout(() => {
                    downloadMedia(key + 1);
                }, 1000);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

downloadMedia(1);