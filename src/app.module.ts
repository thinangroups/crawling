import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlingModule } from './crawling/crawling.module';

@Module({
  imports: [CrawlingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
