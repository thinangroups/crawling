import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CreateCrawlingDto } from './dto/create-crawling.dto';
import { UpdateCrawlingDto } from './dto/update-crawling.dto';

@Controller('crawling')
export class CrawlingController {
  constructor(private readonly crawlingService: CrawlingService) {}

  @Get("main/:id")
  async subUrlsCrawl(@Param("id") id:string) {
    return await this.crawlingService.subUrlsCrawl(id);
  }

  @Get('main-page-urls')
  async getMainPageUrls() {
    return await this.crawlingService.getMainPageUrls();
  }

  @Get('gdelt-project')
  async gdeltprojectCrawl() {
    return await this.crawlingService.gdeltprojectCrawl();
  }

  

}
