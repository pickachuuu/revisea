import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format multiple choice questions with line breaks
export function formatMultipleChoiceQuestion(question: string): string {
  // Check if this looks like a multiple choice question that needs formatting
  if (question.includes('A)') && question.includes('B)') && 
      question.includes('C)') && question.includes('D)') &&
      !question.includes('\nA)') && !question.includes('\nB)')) {
    
    // Format the question with line breaks
    let formattedQuestion = question
      .replace(/A\)/g, '\nA)')
      .replace(/B\)/g, '\nB)')
      .replace(/C\)/g, '\nC)')
      .replace(/D\)/g, '\nD)')
      .trim();
    
    // Remove the first line break if it's at the beginning
    if (formattedQuestion.startsWith('\n')) {
      formattedQuestion = formattedQuestion.substring(1);
    }
    
    return formattedQuestion;
  }
  
  return question;
}