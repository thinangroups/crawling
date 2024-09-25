import { Injectable } from '@nestjs/common';
import { CreateCrawlingDto } from './dto/create-crawling.dto';
import { UpdateCrawlingDto } from './dto/update-crawling.dto';
import { BasicCrawlerService } from 'src/shared/basic';
import { InteractiveCrawlerService } from 'src/shared/interactive';
import { createWriteStream, WriteStream } from 'fs';
import { csvReader } from 'src/shared/csvreader';

@Injectable()
export class CrawlingService {

  mainpageUrls = [
    { url: "https://www.theofficialboard.com/companies/a/0", name: "0" },
    { url: "https://www.theofficialboard.com/companies/a/a", name: "a" },
    { url: "https://www.theofficialboard.com/companies/a/b", name: "b" },
    { url: "https://www.theofficialboard.com/companies/a/c", name: "c" },
    { url: "https://www.theofficialboard.com/companies/a/d", name: "d" },
    { url: "https://www.theofficialboard.com/companies/a/e", name: "e" },
    { url: "https://www.theofficialboard.com/companies/a/f", name: "f" },
    { url: "https://www.theofficialboard.com/companies/a/g", name: "g" },
    { url: "https://www.theofficialboard.com/companies/a/h", name: "h" },
    { url: "https://www.theofficialboard.com/companies/a/i", name: "i" },
    { url: "https://www.theofficialboard.com/companies/a/j", name: "j" },
    { url: "https://www.theofficialboard.com/companies/a/k", name: "k" },
    { url: "https://www.theofficialboard.com/companies/a/l", name: "l" },
    { url: "https://www.theofficialboard.com/companies/a/m", name: "m" },
    { url: "https://www.theofficialboard.com/companies/a/n", name: "n" },
    { url: "https://www.theofficialboard.com/companies/a/o", name: "o" },
    { url: "https://www.theofficialboard.com/companies/a/p", name: "p" },
    { url: "https://www.theofficialboard.com/companies/a/q", name: "q" },
    { url: "https://www.theofficialboard.com/companies/a/r", name: "r" },
    { url: "https://www.theofficialboard.com/companies/a/s", name: "s" },
    { url: "https://www.theofficialboard.com/companies/a/t", name: "t" },
    { url: "https://www.theofficialboard.com/companies/a/u", name: "u" },
    { url: "https://www.theofficialboard.com/companies/a/v", name: "v" },
    { url: "https://www.theofficialboard.com/companies/a/w", name: "w" },
    { url: "https://www.theofficialboard.com/companies/a/x", name: "x" },
    { url: "https://www.theofficialboard.com/companies/a/y", name: "y" },
    { url: "https://www.theofficialboard.com/companies/a/z", name: "z" }
  ]

  constructor(private readonly basicCrawlerService: BasicCrawlerService,
    private readonly interactiveCrawlerService: InteractiveCrawlerService
  ) { }

  async getMainPageUrls() {
    let alphabeticalCategories = this.mainpageUrls;
    let config = {
      waitUntil: "domcontentloaded",
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Host": "www.theofficialboard.com",
        "Accept-Encoding": "gzip, deflate, br, zstd",
      }
    }
    // let response = await this.basciCrawlerService.basicCrawler(mainPageUrl, true);
    for (let category of alphabeticalCategories) {
      let response = await this.interactiveCrawlerService.interactiveCrawler(category.url, config);
      let $: any = response;
      let writeStream = createWriteStream("mainpageurls/" + category.name + ".csv", { encoding: 'utf-8' });
      writeStream.write(`url\n`)

      if ($) {
        console.log("Success: ", category.url)
        let companies = $(".container .row [class=\"col-sm-6\"] li a");
        for (let company of companies) {
          let companyUrl = $(company).attr("href");
          let companyName = $(company).text();
          writeStream.write(`https://www.theofficialboard.com${companyUrl}\n`)
        }
        writeStream.end();
      } else {
        console.log("No return")
      }
    }
    console.log("completed")
    return true;
  }

  async subUrlsCrawl(id: string) {
    console.log("crawling for ", id);

    for (let mainpageUrl of this.mainpageUrls) {
      let urls = await csvReader(`src/mainpageurls/${mainpageUrl.name}.csv`);
      let writeStream = createWriteStream("src/sub_urls/" + mainpageUrl.name + ".csv", { encoding: 'utf-8' });
      writeStream.write(`company_name,url,number,category,position,person_name\n`)
      let failureStream = createWriteStream("src/sub_urls/failure_" + mainpageUrl.name + ".csv", { encoding: 'utf-8' });
      failureStream.write(`url\n`)
      let i = 0;
      let failureCount = 0;
      let promise = [];
      for (let data of urls[Symbol.iterator]()) {
        i++;
        let url = data.url;
        // let url = "https://www.theofficialboard.com/org-chart/72andsunny-new-york-city";
        // this.
        promise.push(this.hitUrlAndCrawl(url, i, failureCount, writeStream));
        if (promise.length == 5) {
          await Promise.all(promise);
          promise = [];
        }

        // break;
      }
      await Promise.all(promise);

      console.log("completed, total: ", i, " failed: ", failureCount, "mainpageurl name: ", mainpageUrl.name);
    }
  }

  async hitUrlAndCrawl(url: string, i: number, failureCount: number, writeStream) {
    try {
      let config = {
        waitUntil: "domcontentloaded",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Host": "www.theofficialboard.com",
          "Accept-Encoding": "gzip, deflate, br, zstd",
        }
      }
      let $: any = await this.interactiveCrawlerService.interactiveCrawler(url, config);
      if ($) {
        console.log("url: ", url, i);
        let companyName = $(".companyNameLink").text();
        let link = $(".official_site.site_link").attr("href");
        let number = $(".callLink").text();
        // writeStream.write(`${companyName},${link},${number},category,position,name\n`);
        let boards = $(".board .board-column .board-block");
        if (boards) {
          this.dataCollector($, boards, "Board", companyName, link, number, ".oc-title", ".oc-name", writeStream)
        }

        let n1s = $(".board-branch .board-branch-row .board-branch-column .ocN1 ul li [id]");
        if (n1s) {
          this.dataCollector($, n1s, "N1", companyName, link, number, ".oc-title", ".oc-name", writeStream)
        }

        let n2s = $(".board-branch .board-branch-row .board-branch-column.ocN2 ul li [id]");
        if (n2s) {
          this.dataCollector($, n2s, "N2", companyName, link, number, ".oc-title", ".oc-name", writeStream)
        }
      } else {
        console.log("failed", url, i, failureCount);
      }
    } catch (err) {

    }

  }

  cleanString(str: string) {
    if (str)
    return str.replace(/["",]/g, '');
  return str;
  }

  dataCollector($: any, element: any, blockName, companyName: string, link: string, number: string, titleTag: string, nameTag: string, writeStream: WriteStream) {
    for (let subElement of element) {
      let title = $(subElement).find(titleTag).text();
      let personName = $(subElement).find(nameTag).text();
      writeStream.write(`${this.cleanString(companyName)},${this.cleanString(link)},${this.cleanString(number)},${blockName},${this.cleanString(title)},${this.cleanString(personName)}\n`);
    }
  }


  async gdeltprojectCrawl() {
    for (let mainpageUrl of this.mainpageUrls) {
      let urls = await csvReader(`src/mainpage_company_names/${mainpageUrl.name}.csv`);
      let writeStream = createWriteStream("src/gdelt/" + mainpageUrl.name + ".csv", { encoding: 'utf-8' });
      writeStream.write(`company_name,title,sourceUrl\n`)
      let failureStream = createWriteStream("src/gdelt/failure_" + mainpageUrl.name + ".csv", { encoding: 'utf-8' });
      failureStream.write(`company_name\n`)
      let i = 0;
      let failureCount = 0;
      let promise = [];
      for (let data of urls[Symbol.iterator]()) {
        i++;
        let url = `https://api.gdeltproject.org/api/v1/search_ftxtsearch/search_ftxtsearch?query=${encodeURIComponent(data.name)}&output=artlist&dropdup=true&maxrows=1000000`
        promise.push(this.gdeltDataCollector(data.name, url, i, failureCount, writeStream, failureStream));
        break;
        if (promise.length == 5) {
          await Promise.all(promise);
          promise = [];
        }

      }
      await Promise.all(promise);

      console.log("completed, total: ", i, " failed: ", failureCount, "mainpageurl name: ", mainpageUrl.name);
    }


    return true;
  }


  async gdeltDataCollector(name, url, i, failureCount:number, writeStream, failureStream) {
    try {
      let tags = {
        title: "b",
        url: "a"
      }
      let config = {
        // waitUntil: "domcontentloaded",
        // headers: {
        //   "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
        //   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //   "Accept-Language": "en-US,en;q=0.9",
        //   "Host": "www.theofficialboard.com",
        //   "Accept-Encoding": "gzip, deflate, br, zstd",
        // }
      }
      let $: any = await this.basicCrawlerService.basicCrawler(url, true);
      if ($) {
        console.log("url: ", url, i);
        let rows = $("tbody tr");
        if (rows) {
          for (let row of rows) {
            let title = $(row).find(tags.title).text();
            let url = $(row).find(tags.url).attr("href") || "je";
            try {
              url = url.split("('")[1].split("')")[0];
            } catch (err) {
              url = ""
            }
            writeStream.write(`${this.cleanString(name)},${this.cleanString(title)},${this.cleanString(url)}\n`);
          }
        }

      } else {
        console.log("failed", url, i, failureCount++);
        failureStream.write(`${name}\n`);
      }
    } catch (err) {
      console.log("error in gdelt", err, failureCount++);
      failureStream.write(`${name}\n`);
    }
    return true;
  }
}
