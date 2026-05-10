import { type Either, failure, success } from '@/core/either.js'
import type { QuestionsRepository } from '../repositories/question.repository.js'
import type { NotAllowedError } from '@/core/errors/errors/not-allowed.error.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error.js'

interface DeleteQuestionUseCaseRequest {
  authorId: string
  questionId: string
}

type DeleteQuestionUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { message: string }
>

export class DeleteQuestionUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    questionId,
    authorId,
  }: DeleteQuestionUseCaseRequest): Promise<DeleteQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId)

    if (!question) {
      return failure(new ResourceNotFoundError())
    }

    if (authorId !== question.authorId.toString()) {
      throw new Error('Not allowed.')
    }

    await this.questionsRepository.delete(question)

    return success({
      message: 'Question deleted successfully.',
    })
  }
}
