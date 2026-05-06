import type { QuestionCommentsRepository } from '../repositories/question-comments.repository.js'

interface DeleteQuestionCommentUseCaseRequest {
  authorId: string
  questionCommentId: string
}

interface DeleteQuestionCommentUseCaseResponse {
  message: string
}

export class DeleteQuestionCommentUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    authorId,
    questionCommentId,
  }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
    const questionComment =
      await this.questionCommentsRepository.findById(questionCommentId)

    if (!questionComment) {
      throw new Error('Question comment not found.')
    }

    if (questionComment.authorId.toString() !== authorId) {
      throw new Error('Not allowed')
    }

    await this.questionCommentsRepository.delete(questionComment)

    return { message: 'Question comment deleted successfully.' }
  }
}
