import { Entity } from '@/core/entities/entity.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'

export interface QuestionCommentProps {
  authorId: UniqueEntityID
  questionId: UniqueEntityID
  content: string
  createdAt: Date
  updatedAt?: Date
}

export class QuestionComment extends Entity<QuestionCommentProps> {
  get authorId() {
    return this._props.authorId
  }

  get content(): string {
    return this._props.content
  }

  get createdAt() {
    return this._props.createdAt
  }

  get updatedAt() {
    return this._props.updatedAt
  }

  private touch() {
    this._props.updatedAt = new Date()
  }

  set content(content: string) {
    this._props.content = content
    this.touch()
  }

  static create(
    props: Optional<QuestionCommentProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const questionComment = new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return questionComment
  }
}
