import { Answer } from "../entities/answer.js";

interface AnswerQuestionUseCaseRequest {
	instructorId: string;
	questionId: string;
	content: string;
}

export class AnswerQuestionUseCase {
	execute({ instructorId, questionId, content }: AnswerQuestionUseCaseRequest) {
		const answer = new Answer(content);

		return answer;
	}
}
