import { Component } from '@angular/core';
import {ApiService} from "./services/api.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private apiService: ApiService) {
  }

  findLinks() {
    this.apiService.fetchAllPageLinks('en', 'Albert Einstein', (links) => {
      document.getElementsByClassName('logger').item(0).innerHTML = links.join('<br/>')
    })
  }
}
