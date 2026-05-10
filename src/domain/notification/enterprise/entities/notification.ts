import { Entity } from '@/core/entities/entity.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'

export interface NotificationProps {
  recipientId: UniqueEntityID
  title: string
  content: string
  createdAt: Date
  readAt?: Date
}

export class Notification extends Entity<NotificationProps> {
  get recipientId() {
    return this._props.recipientId
  }

  get title() {
    return this._props.title
  }

  get content() {
    return this._props.content
  }

  get createdAt() {
    return this._props.createdAt
  }

  get readAt() {
    return this._props.readAt
  }

  read() {
    this._props.readAt = new Date()
  }

  static create(
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const notification = new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return notification
  }
}
