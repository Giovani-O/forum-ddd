import { makeAnswer } from '@test/factories/make-answer.js'
import { makeAnswerComment } from '@test/factories/make-answer-comment.js'
import { InMemoryAnswerAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswerCommentsRepository } from '@test/repositories/in-memory-answer-comments-repository.js'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository.js'
import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository.js'
import { waitFor } from '@test/utils/wait-for.js'
import { beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import type { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository.js'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification.js'
import { OnCommentCreatedOnAnswer } from './on-comment-created-on-answer.js'

let inMemoryAnswerAttachmentsRepository: AnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On comment created on answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(inMemoryNotificationsRepository)

    sendNotificationExecuteSpy = vi.spyOn(sut, 'execute')

    new OnCommentCreatedOnAnswer(inMemoryAnswersRepository, sut)
  })

  it('should send a notification when a comment is created on an answer', async () => {
    const answer = makeAnswer()
    const answerComment = makeAnswerComment({ answerId: answer.id })

    inMemoryAnswersRepository.create(answer)
    inMemoryAnswerCommentsRepository.create(answerComment)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
