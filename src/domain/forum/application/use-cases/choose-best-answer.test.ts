import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Answer } from '../../enterprise/entities/answer.js'
import { Question } from '../../enterprise/entities/question.js'
import { Slug } from '../../enterprise/entities/value-objects/slug.js'
import { ChooseQuestionBestAnswerUseCase } from './choose-best-answer.js'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: ChooseQuestionBestAnswerUseCase

describe('Choose Question Best Answer Use Case', () => {
  beforeEach(() => {
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository()
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

    expect(result.question.bestAnswerId?.toString()).toBe(answerId.toString())
    expect(inMemoryQuestionsRepository.items[0]?.bestAnswerId?.toString()).toBe(
      answerId.toString(),
    )
  })

  it('should throw if answer is not found', async () => {
    await expect(
      sut.execute({
        answerId: 'non-existent-answer',
        authorId: 'author-1',
      }),
    ).rejects.toThrow('Answer not found.')
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

    await expect(
      sut.execute({
        answerId: answerId.toString(),
        authorId: 'author-1',
      }),
    ).rejects.toThrow('Question not found.')
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

    await expect(
      sut.execute({
        answerId: answerId.toString(),
        authorId: differentAuthorId.toString(),
      }),
    ).rejects.toThrow('Not allowed.')
  })
})
