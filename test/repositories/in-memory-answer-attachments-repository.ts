import type { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository.js'
import type { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment.js'

export class InMemoryAnswerAttachmentsRepository
  implements AnswerAttachmentsRepository
{
  public items: AnswerAttachment[] = []

  async findManyByAnswerId(questionId: string) {
    const answerAttachments = this.items.filter(
      (item) => item.answerId.toString() === questionId,
    )

    return answerAttachments
  }

  async deleteManyByAnswerId(questionId: string) {
    const answerAttachments = this.items.filter(
      (item) => item.answerId.toString() !== questionId,
    )

    this.items = answerAttachments
  }
}
