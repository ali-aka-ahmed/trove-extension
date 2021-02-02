export interface IPostHighlight {
  id: string;
  post: { // DBPost
    id: string;
    content: string;
    creationDatetime: number;
  };
  highlight: { // DBHighlight
    id: string;
    creationDatetime: number;
    context: string; // For display on the frontend
    contextStartIdx: number; // Start idx of text in context
    text: string; // Text that was highlighted
    uniqueTextStartIdx: number; // Start idx of text in uniqueText
    uniqueText: string; // Text that has been highlighted + prefix/suffix to make it unique
  };
  url: string;
}
