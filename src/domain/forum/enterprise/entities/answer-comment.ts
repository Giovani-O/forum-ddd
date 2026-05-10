import type { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import type { Optional } from '@/core/types/optional.js'
import { AnswerCommentCreatedEvent } from '@/domain/forum/enterprise/events/answer-comment-created.js'
import { Comment, type CommentProps } from './comment.js'

export interface AnswerCommentProps extends CommentProps {
  answerId: UniqueEntityID
}

export class AnswerComment extends Comment<AnswerCommentProps> {
  get answerId() {
    return this._props.answerId
  }

  static create(
    props: Optional<AnswerCommentProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const answerComment = new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    const isNewComment = !id

    if (isNewComment) {
      answerComment.addDomainEvent(
        new AnswerCommentCreatedEvent(answerComment),
      )
    }

    return answerComment
  }
}
