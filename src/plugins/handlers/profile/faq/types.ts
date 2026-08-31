export interface Faq {
  question: string
  answer: string
}

export interface FaqCategory {
  name: string
  icon: string
  description: string
  faqs: Faq[]
}
