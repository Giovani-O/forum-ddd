import type { AnswerCommentsRepository } from '../repositories/answer-comment-repository.js'

interface DeleteAnswerCommentUseCaseRequest {
  authorId: string
  answerCommentId: string
}

interface DeleteAnswerCommentUseCaseResponse {
  message: string
}

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    authorId,
    answerCommentId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.answerCommentsRepository.findById(answerCommentId)

    if (!answerComment) {
      throw new Error('Answer comment not found.')
    }

    if (answerComment.authorId.toString() !== authorId) {
      throw new Error('Not allowed')
    }

    await this.answerCommentsRepository.delete(answerComment)

    return { message: 'Answer comment deleted successfully.' }
  }
}
