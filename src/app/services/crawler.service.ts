import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CrawlerService {
  constructor(
    public apiService: ApiService
  ) {
  }

  findPath(lang, from, to) {
    let knownLinks = {};
    let unexplored = [from];

    from = this.apiService.cleanPageTitle(from)
    to = this.apiService.cleanPageTitle(to)

    const logger = document.getElementById('logger')

    const log = text => {
      const span = document.createElement('span')
      span.innerHTML = text

      logger.appendChild(span)
    }

    const getFinalPath = () => {
      let path = []
      while (to !== from) {
        path.push(to)
        to = Object.keys(knownLinks).filter(parent => knownLinks[parent].includes(to))[0]
      }
      path.push(from)
      return path.reverse()
    }

    const crawlNextLevel = toVisit => {
      return new Observable<string>(subscriber => {
        this.apiService.fetchAllPagesLinks(lang, toVisit, to).subscribe(
          ({page, link}) => {
            if (!Object.keys(knownLinks).includes(page)) {
              knownLinks[page] = [link]
            } else {
              knownLinks[page].push(link)
            }
            if (!Object.keys(knownLinks).includes(link)) {
              subscriber.next(link)
            }
          },
          subscriber.error,
          () => subscriber.complete()
        )
      })
    }

    return new Observable(subscriber => {
      let level = 0;
      let found = false;
      const continueCrawling = () => {
        level += 1;
        log('Crawling level ' + level + ' links (' + unexplored.length + ') ...')
        const toVisit = unexplored;
        unexplored = [];
        crawlNextLevel(toVisit).subscribe(
          newUnexplored => {
            unexplored.push(newUnexplored)
            if (!found && newUnexplored.includes(to)) {
              found = true;
              subscriber.complete()
              log('Found a path !')
              log(getFinalPath().join(' -> '))
            }
          },
          subscriber.error,
          () => {
            subscriber.next(unexplored)
            if (!found) {
              continueCrawling()
            }
          }
        )
      }
      log('Trying to find a path from ' + from + ' to ' + to)
      continueCrawling()
    })
  }
}
