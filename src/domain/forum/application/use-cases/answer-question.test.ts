import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { AnswerQuestionUseCase } from './answer-question.js'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: AnswerQuestionUseCase

describe('Create Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new AnswerQuestionUseCase(inMemoryAnswersRepository)
  })

  it('should be able to create a answer', async () => {
    const result = await sut.execute({
      questionId: '1',
      instructorId: '1',
      content: 'Conteúdo da resposta',
      attachmentIds: ['1', '2'],
    })

    expect(result.isSuccess()).toBe(true)
    const { answer } = result.value!

    expect(answer.id).toBeTruthy()
    expect(inMemoryAnswersRepository.items[0]?.id).toEqual(answer.id)

    expect(
      inMemoryAnswersRepository.items[0]?.attachments?.currentItems,
    ).toHaveLength(2)
    expect(
      inMemoryAnswersRepository.items[0]?.attachments?.currentItems,
    ).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
    ])
  })
})
