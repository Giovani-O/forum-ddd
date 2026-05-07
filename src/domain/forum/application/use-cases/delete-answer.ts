import { type Either, failure, success } from '@/core/either.js'
import type { AnswersRepository } from '../repositories/answers.repository.js'
import { NotAllowedError } from './errors/not-allowed.error.js'
import { ResourceNotFoundError } from './errors/resource-not-found.error.js'

interface DeleteAnswerUseCaseRequest {
  authorId: string
  answerId: string
}

type DeleteAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    message: string
  }
>

export class DeleteAnswerUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    answerId,
    authorId,
  }: DeleteAnswerUseCaseRequest): Promise<DeleteAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return failure(new ResourceNotFoundError())
    }

    if (authorId !== answer.authorId.toString()) {
      return failure(new NotAllowedError())
    }

    await this.answersRepository.delete(answer)

    return success({ message: 'Answer deleted successfully.' })
  }
}
