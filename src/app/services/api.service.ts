import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WikiApiListResponse} from "../models/wiki-api-list-response";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  maxRequestPageSize = 50
  parallelRequests = 10

  constructor(
    private http: HttpClient
  ) {
  }

  cleanPageTitle(title) {
    return title.replace(/ /g, '_')
  }

  fetchPageOfPageLinks(lang, title, continueValue = null) {
    let url = 'https://' + lang + '.wikipedia.org/w/api.php?';
    url += 'prop=links&format=json&pllimit=500&action=query&origin=*&';
    url += 'titles=' + title;
    if (continueValue) {
      url += '&plcontinue=' + continueValue;
    }
    return this.http.get<WikiApiListResponse>(url);
  }

  fetchAllPagesLinks(lang, pages, goal = null, setFetchedOutput) {
    return new Observable<{ page: string, link: string }>(subscriber => {
      let continueFetching = true
      let parallelsDone = 0
      let fetched = 0

      const fetchNextPageLinks = (pagesToFetch, completionCallback, continueValue = null) => {
        this.fetchPageOfPageLinks(lang, pagesToFetch.join('|'), continueValue).subscribe(response => {
          const pages = response.query.pages;
          Object.keys(pages).forEach(page => {
            if (pages[page].links) {
              pages[page].links.map(link => link.title).forEach(link => {
                link = this.cleanPageTitle(link)
                if (link === goal) {
                  continueFetching = false
                }
                subscriber.next({page: this.cleanPageTitle(pages[page].title), link})
              })
            }
          })
          if (continueFetching && response.continue) {
            fetchNextPageLinks(pagesToFetch, completionCallback, response.continue.plcontinue)
          } else {
            completionCallback()
          }
        })
      }

      const fetchNextRangeOfPagesParallelInstance = offset => {
        if (!continueFetching || offset >= pages.length) {
          parallelsDone += 1
          if (parallelsDone === this.parallelRequests) {
            subscriber.complete()
          }
        } else {
          const increment = this.maxRequestPageSize * this.parallelRequests

          const subPages = pages.slice(offset, offset + this.maxRequestPageSize)
          fetchNextPageLinks(subPages, () => {
            offset += increment
            fetched += subPages.length
            setFetchedOutput(fetched)
            fetchNextRangeOfPagesParallelInstance(offset)
          })
        }
      }

      for (let i = 0; i < this.parallelRequests; i += 1) {
        fetchNextRangeOfPagesParallelInstance(i * this.maxRequestPageSize)
      }
    })
  }
}
