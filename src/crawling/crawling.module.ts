import { Module } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CrawlingController } from './crawling.controller';
import { BasicCrawlerService } from 'src/shared/basic';
import { InteractiveCrawlerService } from 'src/shared/interactive';

@Module({
  controllers: [CrawlingController],
  providers: [CrawlingService, BasicCrawlerService, InteractiveCrawlerService],
})
export class CrawlingModule { }
