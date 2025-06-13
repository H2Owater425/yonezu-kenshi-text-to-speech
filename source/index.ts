import { AudioManager, CODES, SIGNATURES } from './audio';
import { sleep, getImage, getListItem } from './utility';

(function (): void {
	const image: HTMLImageElement | null = document.getElementById("image") as HTMLImageElement;
	const text: HTMLTextAreaElement | null = document.getElementById("text") as HTMLTextAreaElement;
	const start: HTMLElement | null = document.getElementById("start");
	const stop: HTMLElement | null = document.getElementById("stop");
	const signatures: HTMLElement | null = document.getElementById("signatures");
	const audioManager: AudioManager<number> = new AudioManager<number>(CODES);
	let isPlaying: boolean = false;
	const images: HTMLImageElement[] = [getImage("up"), getImage("down")];
	let index: number = 1;
	
	if(image === null || text == null || start == null || stop === null || signatures === null) {
		alert("Elements must exist");

		return;
	}

	for(let i: number = 0; i < SIGNATURES["length"]; i++) {
		signatures.appendChild(getListItem("<" + SIGNATURES[i] + ">", text));
	}

	audioManager.initialize()
	.then(function (): void {
		stop.addEventListener("click", function (): void {
			isPlaying = false;
			audioManager.stop();
			
			return;
		});
	
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

								buffers.push(audioManager.getBuffer(-j) as AudioBuffer)
								console.log("SIGNATURES[" + j + "]", SIGNATURES[j], -j);

								break;
							}
						}

						if(start < i) {
							continue;
						}
					}

					const longCode: number = code + (text["value"].charCodeAt(i + 1) << 4);
					let audioBuffer: AudioBuffer;

					if(audioManager.hasBuffer(longCode)) {
						audioBuffer = audioManager.getBuffer(longCode) as AudioBuffer;
						
						i += 1;
					} else if(audioManager.hasBuffer(code)) {
						audioBuffer = audioManager.getBuffer(code) as AudioBuffer;
					} else {
						console.log(code, longCode)

						continue;
					}

					buffers.push(audioBuffer);
	
					console.log(text["value"][i]);
				}


				buffers.reduce(function (previous: Promise<void>, current: AudioBuffer): Promise<void> {
					return previous.then(function (): Promise<void> {
						if(!isPlaying) {
							return Promise.resolve();
						}

						index = (index + 1) % 2;
						image["src"] = images[index]["src"];

						return audioManager.play(current)
						.then(function (): Promise<void> {
							return sleep(5);
						});
					});
				}, Promise.resolve())
				.then(function (): void {
					isPlaying = false;
					index = 1;
					image["src"] = images[1]["src"];

					return;
				})
				.catch(alert);
			}
		});
	});
})();