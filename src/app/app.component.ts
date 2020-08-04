import { Component } from '@angular/core';
import {ApiService} from "./services/api.service";
import {CrawlerService} from "./services/crawler.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  from: string = 'Parks and Recreation';
  to: string = 'Armageddon (1998 film)';
  lang: string = 'en';
  logHistory: string[] = [];

  constructor(
    private apiService: ApiService,
    private crawlerService: CrawlerService
  ) {
  }

  log(logEntry: string) {
    this.logHistory.push('$ ' + logEntry)
  }

  clearLogs() {
    this.logHistory = []
  }

  findLinks() {
    this.crawlerService.findPath(
      this.lang, this.from, this.to,
      logEntry => this.log(logEntry)
    ).subscribe(console.debug)
  }
}
