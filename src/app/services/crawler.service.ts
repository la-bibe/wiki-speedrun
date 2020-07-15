import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {defer, from, Observable} from "rxjs";
import {mergeAll} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CrawlerService {
  constructor(
    public apiService: ApiService
  ) {
  }

  getPagesLinks(lang, pages) {
    return from(pages.map(page => defer(() => {
      return new Observable(subscriber => {
        let links = [];
        this.apiService.fetchAllPageLinks(lang, page).subscribe(
          link => links.push(link),
          subscriber.error,
          () => {
            subscriber.next({page, links})
            subscriber.complete()
          }
        )
      })
    }))).pipe(mergeAll(5))
  }

  findPath(lang, from, to) {
    let knownLinks = {};
    let unexplored = [from];

    const getUnknownLinks = links => {
      return links.filter(link => !Object.keys(knownLinks).includes(link))
    }

    const crawlNextLevel = toVisit => {
      return new Observable<string>(subscriber => {
        this.getPagesLinks(lang, toVisit).subscribe(
          ({page, links}) => {
            knownLinks[page] = links
            getUnknownLinks(links).forEach(link => subscriber.next(link))
          },
          subscriber.error,
          () => subscriber.complete()
        )
      })
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

    return new Observable(subscriber => {
      let level = 0;
      let found = false;
      const continueCrawling = () => {
        level += 1;
        console.log("## BEGINNING CRAWLING LEVEL " + level + " ##")
        const toVisit = unexplored;
        unexplored = [];
        crawlNextLevel(toVisit).subscribe(
          newUnexplored => {
            if (!found && newUnexplored.includes(to)) {
              // TODO Find a way to stop crawling toVisit after found
              found = true;
              subscriber.complete()
              console.log("Found it ! Yeeey !")
              console.log(getFinalPath())
            }
            unexplored.push(newUnexplored)
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
      continueCrawling()
    })
  }
}
