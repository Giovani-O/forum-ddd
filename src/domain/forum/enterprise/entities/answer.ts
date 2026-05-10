import { AggregateRoot } from '@/core/entities/aggregate-root.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'
import { AnswerCreatedEvent } from '@/domain/forum/enterprise/events/answer-created-event.js'
import { AnswerAttachmentList } from './answer-attachment-list.js'

export interface AnswerProps {
  authorId: UniqueEntityID
  questionId: UniqueEntityID
  content: string
  attachments: AnswerAttachmentList
  createdAt: Date
  updatedAt?: Date
}

export class Answer extends AggregateRoot<AnswerProps> {
  get authorId() {
    return this._props.authorId
  }

  get questionId() {
    return this._props.questionId
  }

  get content(): string {
    return this._props.content
  }

  get attachments() {
    return this._props.attachments
  }

  get createdAt() {
    return this._props.createdAt
  }

  get updatedAt() {
    return this._props.updatedAt
  }

  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...')
  }

  private touch() {
    this._props.updatedAt = new Date()
  }

  set content(content: string) {
    this._props.content = content
    this.touch()
  }

  set attachments(attachments: AnswerAttachmentList) {
    this._props.attachments = attachments
    this.touch()
  }

  static create(
    props: Optional<AnswerProps, 'createdAt' | 'attachments'>,
    id?: UniqueEntityID,
  ) {
    const answer = new Answer(
      {
        ...props,
        attachments: props.attachments ?? new AnswerAttachmentList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    const isNewAnswer = !id

    if (isNewAnswer) answer.addDomainEvent(new AnswerCreatedEvent(answer))

    return answer
  }
}
