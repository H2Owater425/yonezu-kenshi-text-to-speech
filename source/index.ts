import { AudioManager, CODES, SIGNATURES } from './audio';
import { sleep, getImage, getListItem } from './utility';

(function (): void {
	const image: HTMLImageElement | null = document.getElementById("image") as HTMLImageElement;
	const text: HTMLTextAreaElement | null = document.getElementById("text") as HTMLTextAreaElement;
	const start: HTMLElement | null = document.getElementById("start");
	const volume: HTMLInputElement | null = document.getElementById("volume") as HTMLInputElement;
	const stop: HTMLElement | null = document.getElementById("stop");
	const clear: HTMLElement | null = document.getElementById("clear");
	const signatures: HTMLElement | null = document.getElementById("signatures");
	const images: HTMLImageElement[] = [getImage("up"), getImage("down")];
	const audioManager: AudioManager<number> = new AudioManager<number>(CODES);
	let index: number = 1;
	let isPlaying: boolean = false;

	if(image === null || text === null || start === null || volume === null || stop === null || clear === null || signatures === null) {
		alert("Elements must exist");

		return;
	}

	for(let i: number = 0; i < SIGNATURES["length"]; i++) {
		signatures.appendChild(getListItem("<" + SIGNATURES[i] + ">", text));
	}

	function setImage(i: number): void {
		index = i % 2;
		// @ts-expect-error
		image["src"] = images[index]["src"];

		return;
	}

	audioManager.initialize()
	.then(function (): void {
		stop.addEventListener("click", function (): void {
			isPlaying = false;
			audioManager.stop();

			return;
		});

		clear.addEventListener("click", function (): void {
			text["value"] = "";
			text.focus();

			return;
		});

		volume.addEventListener("input", function (): void {
			audioManager.setGain(volume["valueAsNumber"] / 100);

			return;
		});

		const spaceAudioBuffer: AudioBuffer = audioManager.getBuffer(12288) as AudioBuffer;

		start.addEventListener("click", function (): void {
			if(!isPlaying) {
				isPlaying = true;

				const buffers: AudioBuffer[] = [];

				for(let i: number = 0; i < text["value"]["length"]; i++) {
					const code: number = text["value"].charCodeAt(i);

					if(code === 60) {
						const start: number = i + 1;

						for(let j: number = 0; j < SIGNATURES["length"]; j++) {
							if(text["value"].startsWith(SIGNATURES[j] + ">", start)) {
								i = start + SIGNATURES[j]["length"];

								buffers.push(audioManager.getBuffer(-j) as AudioBuffer);

								break;
							}
						}

						if(start < i) {
							continue;
						}
					}

					const longCode: number = code + (text["value"].charCodeAt(i + 1) << 4);

					if(audioManager.hasBuffer(longCode)) {
						buffers.push(audioManager.getBuffer(longCode) as AudioBuffer);

						i += 1;
					} else if(audioManager.hasBuffer(code)) {
						buffers.push(audioManager.getBuffer(code) as AudioBuffer);
					} else {
						buffers.push(spaceAudioBuffer);
					}
				}

				buffers.reduce(function (previous: Promise<void>, current: AudioBuffer): Promise<void> {
					return previous.then(function (): Promise<void> {
						if(!isPlaying) {
							return Promise.resolve();
						}

						if(current !== spaceAudioBuffer) {
							sleep(current["duration"] / 2)
							.then(function (): void {
								setImage(0);
							});
						}
						
						return audioManager.play(current)
						.then(function (): Promise<void> {
							setImage(1);

							return sleep(5);
						});
					});
				}, Promise.resolve())
				.then(function (): void {
					isPlaying = false;

					setImage(1);

					return;
				})
				.catch(alert);
			}
		});
	});
})();