import { Component } from '@angular/core';
import {ApiService} from "./services/api.service";
import {CrawlerService} from "./services/crawler.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  from: string = 'Sattleria_sophiae';
  to: string = 'Syrmadaula';

  constructor(
    private apiService: ApiService,
    private crawlerService: CrawlerService
  ) {
  }

  findLinks() {
    this.crawlerService.findPath('en', this.from, this.to).subscribe(console.debug)
  }
}
