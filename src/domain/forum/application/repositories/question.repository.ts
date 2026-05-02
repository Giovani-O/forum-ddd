import type { Question } from '../../enterprise/entities/question.js'

export interface QuestionsRepository {
  create(question: Question): Promise<void>
}
