/**
 * Question é um aggregate root, representando uma pergunta no fórum
 * Attachment é um aggregate, que só pode ser criado/editado a partir de uma Question
 */

import dayjs from 'dayjs'
import { AggregateRoot } from '@/core/entities/aggregate-root.js'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'
import { QuestionAttachmentList } from './question-attachment-list.js'
import { Slug } from './value-objects/slug.js'

export interface QuestionProps {
  authorId: UniqueEntityID
  bestAnswerId?: UniqueEntityID | undefined
  title: string
  content: string
  slug: Slug
  attachments: QuestionAttachmentList
  createdAt: Date
  updatedAt?: Date
}

export class Question extends AggregateRoot<QuestionProps> {
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

  get attachments() {
    return this._props.attachments
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

  set attachments(attachments: QuestionAttachmentList) {
    this._props.attachments = attachments
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
    props: Optional<QuestionProps, 'createdAt' | 'slug' | 'attachments'>,
    id?: UniqueEntityID,
  ) {
    const question = new Question(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        attachments: props.attachments ?? new QuestionAttachmentList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return question
  }
}
