import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { SendNotificationUseCase } from './send-notification.js'

let inMemoryRepository: InMemoryNotificationsRepository
let sut: SendNotificationUseCase // System Under Test

describe('Send notification tests', () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(inMemoryRepository)
  })

  it('should create a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'New notification!',
      content: 'Lorem Ipsum',
    })

    expect(result.isSuccess()).toBe(true)
    expect(inMemoryRepository.items[0]).toEqual(result.value?.notification)
  })
})
