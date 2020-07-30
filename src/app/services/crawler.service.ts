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

    const getFinalPath = () => {
      let path = []
      while (to !== from) {
        path.push(to)
        // TODO Handle special characters (space = underscore)
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
        console.log("## BEGINNING CRAWLING LEVEL " + level + " ##")
        const toVisit = unexplored;
        unexplored = [];
        crawlNextLevel(toVisit).subscribe(
          newUnexplored => {
            unexplored.push(newUnexplored)
            if (!found && newUnexplored.includes(to)) {
              found = true;
              subscriber.complete()
              console.log("Found it ! Yeeey !")
              console.log(getFinalPath())
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
      continueCrawling()
    })
  }
}
