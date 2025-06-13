export function getImage(name: string): HTMLImageElement {
	const image: HTMLImageElement = new Image();

	image["src"] = "/images/" + name + ".png";

	return image;
}

export function getListItem(content: string, text: HTMLTextAreaElement): HTMLLIElement {
	const listItem: HTMLLIElement = document.createElement("li");
	listItem["textContent"] = content;

	listItem.addEventListener("click", function (): void {
		const index: number = text["selectionStart"];

		text["value"] = text["value"].slice(0, index) + content + text["value"].slice(index);

		text.focus();

		text["selectionStart"] = index + content["length"];
		text["selectionEnd"] = text["selectionStart"];

		return;
	});

	return listItem;
}

export function sleep(delay: number): Promise<void> {
	return new Promise<void>(function (resolve: () => void): void {
		const start: number = performance.now();

		function loop(now: number): void {
			if(now - start >= delay) {
				resolve();
			} else {
				requestAnimationFrame(loop);
			}

			return;
		}

		requestAnimationFrame(loop);
	});
}