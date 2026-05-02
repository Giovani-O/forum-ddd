import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryQuestionsRepository } from '../../../../../test/repositories/in-memory-questions-repository.js'
import type { QuestionsRepository } from '../repositories/question.repository.js'
import { CreateQuestionUseCase } from './create-question.js'

let inMemoryRepository: QuestionsRepository
let sut: CreateQuestionUseCase // System Under Test

describe('Create question tests', () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryQuestionsRepository()
    sut = new CreateQuestionUseCase(inMemoryRepository)
  })

  it('should create a question', async () => {
    const { question } = await sut.execute({
      authorId: '1',
      title: 'Is this a question?',
      content: 'I am not sure',
    })

    expect(question.id).toBeDefined()
    expect(question.title).toBe('Is this a question?')
  })
})
