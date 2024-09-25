import { Injectable } from "@nestjs/common";
import cheerio from "cheerio";
import puppeteer from "puppeteer";

@Injectable()
export class InteractiveCrawlerService {
    constructor() {

    }

    async interactiveCrawler(url: string, config: any) {
        let response = null;
        let args = [
            "--no-sandbox",
            "--disable-gpu",
            "--incognito",
            "--window-size=1366,768"
        ]
        const browser = await puppeteer.launch({
            headless: false,
            args: args,
        });

        try {

            let page = await browser.newPage();

            // await page.setExtraHTTPHeaders(config.headers);

            await page.setRequestInterception(true);
            page.on('request', async (req: any) => {
                if (config.waitUntil == "domcontentloaded") {
                    if (req.resourceType() === "document") {
                        req.continue();
                    } else {
                        req.abort();
                    }
                }
            })

            page.on('response', async (res: any) => {
                if (res.url().includes(url)) {
                    console.log("Status:", res.status())
                }
            })

            page.on('error', async (err: any) => {
                console.log("Error crawling :", err)
            })


            await page.goto(url, { waitUntil: config.waitUntil || "domcontentloaded" })

            let content = await page.content();

            let $ = cheerio.load(content);

            await browser.close();

            return $

        } catch (err) {
            console.log("Error in crawling service", err);
            await browser.close();

            return false;
        }

    }
}