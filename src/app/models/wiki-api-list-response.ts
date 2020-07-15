export interface WikiApiListResponse {
  continue?: {
    plcontinue: string;
  },
  query: {
    pages: {
      [pageId: string]: {
        links: [{
          title: string;
        }]
      }
    }
  }
}
