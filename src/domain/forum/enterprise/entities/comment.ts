import { Entity } from '@/core/entities/entity.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

export interface CommentProps {
  authorId: UniqueEntityID
  content: string
  createdAt: Date
  updatedAt?: Date
}

export abstract class Comment<
  Props extends CommentProps,
> extends Entity<Props> {
  get authorId() {
    return this._props.authorId
  }

  get content() {
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
}
