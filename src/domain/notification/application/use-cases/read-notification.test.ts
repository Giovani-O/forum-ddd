import { makeNotification } from '@test/factories/make-notification.js'
import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { ReadNotificationUseCase } from './read-notification.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error.js'

let inMemoryRepository: InMemoryNotificationsRepository
let sut: ReadNotificationUseCase // System Under Test

describe('Read notification tests', () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryNotificationsRepository()
    sut = new ReadNotificationUseCase(inMemoryRepository)
  })

  it('should read a notification', async () => {
    const notification = makeNotification()

    await inMemoryRepository.create(notification)

    const result = await sut.execute({
      recipientId: notification.recipientId.toString(),
      notificationId: notification.id.toString(),
    })

    expect(result.isSuccess()).toBe(true)
    expect(inMemoryRepository.items[0]?.readAt).toEqual(expect.any(Date))
  })

  it('should not be able to read a notification from another user', async () => {
    const notification = makeNotification({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    await inMemoryRepository.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: 'recipient-2',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
