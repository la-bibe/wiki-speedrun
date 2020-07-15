import { TestBed } from '@angular/core/testing';

import { CrawlerService } from './crawler.service';

describe('CrawlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrawlerService = TestBed.get(CrawlerService);
    expect(service).toBeTruthy();
  });
});
