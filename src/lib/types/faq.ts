export interface FaqItem {
  question: string;
  answer: string | string[];
}

export interface FaqData {
  [key: string]: FaqItem;
}
