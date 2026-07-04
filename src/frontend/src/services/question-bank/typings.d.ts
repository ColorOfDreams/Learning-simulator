declare namespace QuestionBank {
  interface Record {
    _id: string;
    question: string;
    subject: string;
    grade: string | number;
    type: string;
    topic: string;
    difficulty: number;
    answerMode?: string;
    options?: any;
    correctAnswer?: string;
    explanation?: string;
    tags?: string[];
    [key: string]: any;
  }
}
