import { expect, it } from "vitest";
import { Slug } from "./slug.js";

it("should be able to create a new slug from text", () => {
	const slug = Slug.createFromText("Example question title");

	expect(slug.value).toBe("example-question-title");
});
