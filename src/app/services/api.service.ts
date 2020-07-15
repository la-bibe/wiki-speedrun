import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WikiApiListResponse} from "../models/wiki-api-list-response";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) {
  }

  fetchPageOfPageLinks(lang, title, continueValue = null) {
    let url = 'https://' + lang + '.wikipedia.org/w/api.php?';
    url += 'prop=links&format=json&pllimit=500&action=query&origin=*&';
    url += 'titles=' + title; // TODO Use multiple titles to search faster
    if (continueValue) {
      url += '&plcontinue=' + continueValue;
    }
    return this.http.get<WikiApiListResponse>(url);
  }

  fetchAllPageLinks(lang, title) {
    return new Observable<string>(subscriber => {
      const fetchNextPageLinks = (continueValue = null) => {
        this.fetchPageOfPageLinks(lang, title, continueValue).subscribe(response => {
          const pages = response.query.pages;
          if (pages[Object.keys(pages)[0]].links) {
            pages[Object.keys(pages)[0]].links.map(link => link.title).forEach(link => subscriber.next(link))
          }
          if (response.continue) {
            fetchNextPageLinks(response.continue.plcontinue)
          } else {
            subscriber.complete();
          }
        })
      }

      fetchNextPageLinks()
    })
  }
}
