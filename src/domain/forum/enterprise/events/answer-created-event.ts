import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { DomainEvent } from '@/core/events/domain-event.js'
import type { Answer } from '@/domain/forum/enterprise/entities/answer.js'

export class AnswerCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public answer: Answer

  constructor(answer: Answer) {
    this.answer = answer
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.answer.id
  }
}
