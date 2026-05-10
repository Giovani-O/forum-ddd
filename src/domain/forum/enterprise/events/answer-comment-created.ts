import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { DomainEvent } from '@/core/events/domain-event.js'
import type { AnswerComment } from '../entities/answer-comment.js'

export class AnswerCommentCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public answerComment: AnswerComment

  constructor(answerComment: AnswerComment) {
    this.answerComment = answerComment
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.answerComment.id
  }
}
