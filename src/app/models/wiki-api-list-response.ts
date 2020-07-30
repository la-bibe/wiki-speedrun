export interface WikiApiListResponse {
  continue?: {
    plcontinue: string;
  },
  query: {
    pages: {
      [pageId: string]: {
        title: string,
        links: [{
          title: string;
        }]
      }
    }
  }
}
