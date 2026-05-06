import { type Either, failure, success } from '@/core/either.js'
import type { AnswerCommentsRepository } from '../repositories/answer-comment-repository.js'

interface DeleteAnswerCommentUseCaseRequest {
  authorId: string
  answerCommentId: string
}

type DeleteAnswerCommentUseCaseResponse = Either<string, {}>

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    authorId,
    answerCommentId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.answerCommentsRepository.findById(answerCommentId)

    if (!answerComment) {
      return failure('Answer comment not found.')
    }

    if (answerComment.authorId.toString() !== authorId) {
      return failure('Not allowed')
    }

    await this.answerCommentsRepository.delete(answerComment)

    return success({})
  }
}
