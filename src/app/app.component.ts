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
  unexplored: number = 0;
  fetching: number = 0;
  fetched: number = 0;

  constructor(
    private apiService: ApiService,
    private crawlerService: CrawlerService
  ) {
  }

  log(logEntry: string) {
    this.logHistory.push('$ ' + logEntry)
  }

  setUnexplored(unexplored: number) {
    this.unexplored = unexplored
  }

  setFetching(fetching: number) {
    this.fetching = fetching
  }

  setFetched(fetched: number) {
    this.fetched = fetched
  }

  clearLogs() {
    this.logHistory = []
  }

  findLinks() {
    this.crawlerService.findPath(
      this.lang, this.from, this.to,
      this.log.bind(this),
      this.setUnexplored.bind(this),
      this.setFetching.bind(this),
      this.setFetched.bind(this)
    ).subscribe(console.debug)
  }
}
