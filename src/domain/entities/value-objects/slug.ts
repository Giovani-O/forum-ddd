export class Slug {
	public value: string;

	constructor(value: string) {
		this.value = value;
	}

	/** Creates a slug from a given text string. */
	static createFromText(text: string): Slug {
		const slug = text
			.normalize("NFKD")
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^\w-]+/g, "")
			.replace(/_/g, "-")
			.replace(/--+/g, "-")
			.replace(/-$/g, "");
		return new Slug(slug);
	}
}
