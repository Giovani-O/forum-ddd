import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachments-repository.js'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { CreateQuestionUseCase } from './create-question.js'

let inMemoryRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: CreateQuestionUseCase // System Under Test

describe('Create question tests', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    sut = new CreateQuestionUseCase(inMemoryRepository)
  })

  it('should create a question', async () => {
    const result = await sut.execute({
      authorId: '1',
      title: 'Is this a question?',
      content: 'I am not sure',
      attachmentIds: ['1', '2'],
    })

    expect(result.isSuccess()).toBe(true)
    const { question } = result.value!

    expect(question.id).toBeDefined()
    expect(question.title).toEqual('Is this a question?')
    expect(inMemoryRepository.items[0]?.attachments.currentItems).toHaveLength(
      2,
    )
    expect(inMemoryRepository.items[0]?.attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
    ])
  })
})
