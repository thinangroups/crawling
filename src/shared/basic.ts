import { Injectable } from "@nestjs/common";
import UserAgent = require("user-agents");
import Crawler = require('crawler');
import cheerio from 'cheerio';
import { createWriteStream } from "fs";

@Injectable()
export class BasicCrawlerService {
    constructor() {
    }

    async basicCrawler(url: string, useragent: Boolean = true) {

        return new Promise(async (resolve, reject) => {
            let response = null;

            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            const randomUA = userAgent.random();
            let configOptions = {
                maxConnections: 2,
                retries: 2,
                retryTimeout: 10000,
                rotateUS: true,
                skipEventRequest: false,
                jquery: false,
                timeout: 30000,
                rejectUnauthorized: false,
                ignoreHTTPSErrors: true,
                strictSSL: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Host": "www.theofficialboard.com",
                    "Accept-Encoding":"gzip, deflate, br, zstd",
                    // "cookie":"PHPSESSID=6csgrsailql3voadbnpop9sb5c;"
                }
            };


            const basicCrawler = new Crawler(configOptions);

            basicCrawler.once('drain', () => {
                return resolve(response);
            })


            try {
                let crawlerCallback = async (error, res: any, done) => {
                    // let response = null;
                    if (error) {
                        response = null;
                    } else {
                        let options = res.options;
                        let $;
                        try {
                            $ = cheerio.load(res.body);
                        } catch (err) {
                            $ = undefined;
                        }
                        console.log("uri: ", res.statusCode)
                        if (res.statusCode >= 200 && res.statusCode < 400) {
                            // let writeStream = createWriteStream("hello.html", { encoding: 'utf-8' });
                            // writeStream.write(res.body.toString());
                            // writeStream.end()
                            response = $;
                        } else {
                            reject(false);
                        }
                    }


                    done();
                }
                let urls = [{ callback: crawlerCallback, uri: url }]
                basicCrawler.queue(urls)

            } catch (err) {
                return reject(false);
            }

        }).catch(err => {
            console.log(err);
            return false;
        })
    }
}