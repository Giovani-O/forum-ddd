import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachments-repository.js'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Answer } from '../../enterprise/entities/answer.js'
import { Question } from '../../enterprise/entities/question.js'
import { Slug } from '../../enterprise/entities/value-objects/slug.js'
import { ChooseQuestionBestAnswerUseCase } from './choose-best-answer.js'
import { NotAllowedError } from './errors/not-allowed.error.js'
import { ResourceNotFoundError } from './errors/resource-not-found.error.js'

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: ChooseQuestionBestAnswerUseCase

describe('Choose Question Best Answer Use Case', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new ChooseQuestionBestAnswerUseCase(
      inMemoryQuestionsRepository,
      inMemoryAnswersRepository,
    )
  })

  it('should be able to choose the best answer for a question', async () => {
    const questionId = new UniqueEntityID('question-1')
    const answerId = new UniqueEntityID('answer-1')
    const authorId = new UniqueEntityID('author-1')

    const question = Question.create(
      {
        authorId,
        title: 'Test Question',
        content: 'Test Content',
        slug: Slug.create('test-question'),
      },
      questionId,
    )

    const answer = Answer.create(
      {
        authorId: new UniqueEntityID('author-2'),
        questionId,
        content: 'Test Answer',
      },
      answerId,
    )

    inMemoryQuestionsRepository.items.push(question)
    inMemoryAnswersRepository.items.push(answer)

    const result = await sut.execute({
      answerId: answerId.toString(),
      authorId: authorId.toString(),
    })

    expect(result.isSuccess()).toBe(true)
    if (result.isSuccess()) {
      expect(result.value.question.bestAnswerId?.toString()).toBe(
        answerId.toString(),
      )
      expect(
        inMemoryQuestionsRepository.items[0]?.bestAnswerId?.toString(),
      ).toBe(answerId.toString())
    }
  })

  it('should throw if answer is not found', async () => {
    const result = await sut.execute({
      answerId: 'non-existent-answer',
      authorId: 'author-1',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw if question is not found', async () => {
    const answerId = new UniqueEntityID('answer-1')
    const answer = Answer.create(
      {
        authorId: new UniqueEntityID('author-2'),
        questionId: new UniqueEntityID('non-existent-question'),
        content: 'Test Answer',
      },
      answerId,
    )

    inMemoryAnswersRepository.items.push(answer)

    const result = await sut.execute({
      answerId: answerId.toString(),
      authorId: 'author-1',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw if author is not the question author', async () => {
    const questionId = new UniqueEntityID('question-1')
    const answerId = new UniqueEntityID('answer-1')
    const questionAuthorId = new UniqueEntityID('author-1')
    const differentAuthorId = new UniqueEntityID('author-2')

    const question = Question.create(
      {
        authorId: questionAuthorId,
        title: 'Test Question',
        content: 'Test Content',
        slug: Slug.create('test-question'),
      },
      questionId,
    )

    const answer = Answer.create(
      {
        authorId: differentAuthorId,
        questionId,
        content: 'Test Answer',
      },
      answerId,
    )

    inMemoryQuestionsRepository.items.push(question)
    inMemoryAnswersRepository.items.push(answer)

    const result = await sut.execute({
      answerId: answerId.toString(),
      authorId: differentAuthorId.toString(),
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
