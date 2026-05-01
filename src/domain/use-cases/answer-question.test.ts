import { expect, it } from "vitest";
import type { Answer } from "../entities/answer.js";
import type { AnswersRepository } from "../repositories/answers.repository.js";
import { AnswerQuestionUseCase } from "./answer-question.js";

const fakeAnswersRepository: AnswersRepository = {
	create: async (answer: Answer) => {
		return;
	},
};

it("should create an answer", async () => {
	const answerQuestion = new AnswerQuestionUseCase(fakeAnswersRepository);

	const answer = await answerQuestion.execute({
		instructorId: "1",
		questionId: "1",
		content: "Nova resposta",
	});

	expect(answer.id).toBeDefined();
	expect(answer.content).toBe("Nova resposta");
});
