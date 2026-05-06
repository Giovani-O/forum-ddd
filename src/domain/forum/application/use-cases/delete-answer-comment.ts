import { type Either, failure, success } from "@/core/either.js";
import type { AnswerCommentsRepository } from "../repositories/answer-comment-repository.js";
import { NotAllowedError } from "./errors/not-allowed.error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found.error.js";

interface DeleteAnswerCommentUseCaseRequest {
  authorId: string;
  answerCommentId: string;
}

type DeleteAnswerCommentUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {}
>;

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    authorId,
    answerCommentId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.answerCommentsRepository.findById(answerCommentId);

    if (!answerComment) {
      return failure(new ResourceNotFoundError());
    }

    if (answerComment.authorId.toString() !== authorId) {
      return failure(new NotAllowedError());
    }

    await this.answerCommentsRepository.delete(answerComment);

    return success({});
  }
}
