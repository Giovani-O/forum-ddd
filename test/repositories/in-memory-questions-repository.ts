import type { QuestionsRepository } from "@/domain/forum/application/repositories/question.repository.js";
import type { Question } from "@/domain/forum/enterprise/entities/question.js";

export class InMemoryQuestionsRepository implements QuestionsRepository {
    public items: Question[] = []

    async create(question: Question) {
        this.items.push(question)
    }

}
