import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WikiApiListResponse} from "../models/wiki-api-list-response";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  fetchPageOfPageLinks(lang, title, continueValue = null) {
    let url = 'https://' + lang + '.wikipedia.org/w/api.php?';
    url += 'prop=links&format=json&pllimit=500&action=query&origin=*&';
    url += 'titles=' + title;
    if (continueValue) {
      url += '&plcontinue=' + continueValue;
    }
    return this.http.get<WikiApiListResponse>(url);
  }

  fetchAllPageLinks(lang, title, callback) {
    let links = [];

    const fetchNextPageLinks = (continueValue = null) => {
      this.fetchPageOfPageLinks(lang, title, continueValue).subscribe(response => {
        const pages = response.query.pages;
        links.push(...pages[Object.keys(pages)[0]].links.map(link => link.title))
        if (response.continue) {
          fetchNextPageLinks(response.continue.plcontinue)
        } else {
          callback(links)
        }
      })
    }

    fetchNextPageLinks()
  }
}
