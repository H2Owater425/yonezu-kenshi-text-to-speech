export function getImage(name: string): HTMLImageElement {
	const image: HTMLImageElement = new Image();

	image["src"] = "/images/" + name + ".png";

	return image;
}

export function getListItem(content: string): HTMLLIElement {
	const listItem: HTMLLIElement = document.createElement("li");

	listItem["textContent"] = content;

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