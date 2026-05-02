import dayjs from 'dayjs'
import { Entity } from '@/core/entities/entity.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'
import { Slug } from './value-objects/slug.js'

interface QuestionProps {
  authorId: UniqueEntityID
  bestAnswerId?: UniqueEntityID | undefined
  title: string
  content: string
  slug: Slug
  createdAt: Date
  updatedAt?: Date
}

export class Question extends Entity<QuestionProps> {
  get authorId() {
    return this._props.authorId
  }

  get bestAnswerId() {
    return this._props.bestAnswerId
  }

  get title() {
    return this._props.title
  }

  get content() {
    return this._props.content
  }

  get slug() {
    return this._props.slug
  }

  get createdAt() {
    return this._props.createdAt
  }

  get updatedAt() {
    return this._props.updatedAt
  }

  get isNew(): boolean {
    return dayjs().diff(this.createdAt, 'days') <= 3
  }

  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...')
  }

  private touch() {
    this._props.updatedAt = new Date()
  }

  set title(title: string) {
    this._props.title = title
    this._props.slug = Slug.createFromText(title)

    this.touch()
  }

  set content(content: string) {
    this._props.content = content
    this.touch()
  }

  set bestAnswerId(bestAnswerId: UniqueEntityID | undefined) {
    this._props.bestAnswerId = bestAnswerId
    this.touch()
  }

  static create(
    props: Optional<QuestionProps, 'createdAt' | 'slug'>,
    id?: UniqueEntityID,
  ) {
    const question = new Question(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        createdAt: new Date(),
      },
      id,
    )

    return question
  }
}
