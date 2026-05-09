import { makeAnswer } from '@test/factories/make-answer.js'
import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers.js'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: FetchQuestionAnswersUseCase

describe('Fetch Question Answers', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new FetchQuestionAnswersUseCase(inMemoryAnswersRepository)
  })

  it('should be able to fetch question answers', async () => {
    const questionId = 'question-1'

    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityID(questionId) }),
    )
    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityID(questionId) }),
    )
    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityID('another-question') }),
    )

    const result = await sut.execute({
      questionId,
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    const { answers } = result.value!

    expect(answers).toHaveLength(2)
    expect(answers).toEqual([
      expect.objectContaining({ questionId: new UniqueEntityID(questionId) }),
      expect.objectContaining({ questionId: new UniqueEntityID(questionId) }),
    ])
  })

  it('should be able to fetch paginated question answers', async () => {
    const questionId = 'question-1'

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswersRepository.create(
        makeAnswer({ questionId: new UniqueEntityID(questionId) }),
      )
    }

    const result = await sut.execute({
      questionId,
      page: 2,
    })

    expect(result.isSuccess()).toBe(true)
    const { answers } = result.value!

    expect(answers).toHaveLength(2)
  })
})
