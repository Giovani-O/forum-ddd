import { makeAnswer } from '@test/factories/make-answer.js'
import { makeQuestion } from '@test/factories/make-question.js'
import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository.js'
import { InMemoryQuestionAttachmentsRepository } from '@test/repositories/in-memory-question-attachments-repository.js'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository.js'
import { waitFor } from '@test/utils/wait-for.js'
import { beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import type { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository.js'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification.js'
import { OnAnswerCreated } from './on-answer-created.js'

let inMemoryQuestionAttachmentsRepoitory: InMemoryQuestionAttachmentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryAnswerAttachmentsRepository: AnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On answer created', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepoitory =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepoitory,
    )
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(inMemoryNotificationsRepository)

    sendNotificationExecuteSpy = vi.spyOn(sut, 'execute')

    new OnAnswerCreated(inMemoryQuestionsRepository, sut)
  })

  it('should send a notification when an answer is created', async () => {
    const question = makeQuestion()
    const answer = makeAnswer({ questionId: question.id })

    inMemoryQuestionsRepository.create(question)
    inMemoryAnswersRepository.create(answer)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
