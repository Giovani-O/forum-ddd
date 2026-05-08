import { type Either, failure, success } from '@/core/either.js'
import type { QuestionCommentsRepository } from '../repositories/question-comments.repository.js'
import { NotAllowedError } from './errors/not-allowed.error.js'
import { ResourceNotFoundError } from './errors/resource-not-found.error.js'

interface DeleteQuestionCommentUseCaseRequest {
  authorId: string
  questionCommentId: string
}

type DeleteQuestionCommentUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { message: string }
>

export class DeleteQuestionCommentUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    authorId,
    questionCommentId,
  }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
    const questionComment =
      await this.questionCommentsRepository.findById(questionCommentId)

    if (!questionComment) {
      return failure(new ResourceNotFoundError())
    }

    if (questionComment.authorId.toString() !== authorId) {
      return failure(new NotAllowedError())
    }

    await this.questionCommentsRepository.delete(questionComment)

    return success({ message: 'Question comment deleted successfully.' })
  }
}
