import { AudioManager, CODES, SIGNATURES } from './audio';
import { sleep, getImage, getListItem } from './utility';

(function (): void {
	const image: HTMLImageElement | null = document.getElementById("image") as HTMLImageElement;
	const text: HTMLTextAreaElement | null = document.getElementById("text") as HTMLTextAreaElement;
	const start: HTMLButtonElement | null = document.getElementById("start") as HTMLButtonElement;
	const volume: HTMLInputElement | null = document.getElementById("volume") as HTMLInputElement;
	const stop: HTMLElement | null = document.getElementById("stop");
	const clear: HTMLElement | null = document.getElementById("clear");
	const signatures: HTMLElement | null = document.getElementById("signatures");
	const images: HTMLImageElement[] = [getImage("down"), getImage("up")];
	const audioManager: AudioManager<number> = new AudioManager<number>(CODES);
	const previousVolume: number = Number.parseInt(localStorage.getItem("volume") as string);

	if(image === null || text === null || start === null || volume === null || stop === null || clear === null || signatures === null) {
		alert("Elements must exist");

		return;
	}

	function setImage(index: number): void {
		// @ts-expect-error
		image["src"] = images[index]["src"];
		
		return;
	}

	function setPlaying(isPlaying: boolean): void {
		// @ts-expect-error
		start["disabled"] = isPlaying;

		return;
	}

	if(!Number.isNaN(previousVolume) && previousVolume >= 0 && previousVolume <= 100) {
		volume["valueAsNumber"] = previousVolume;
		audioManager.setGain(previousVolume / 100);
	} else {
		localStorage.setItem("volume", "100");
	}

	for(let i: number = 0; i < SIGNATURES["length"]; i++) {
		signatures.appendChild(getListItem("<" + SIGNATURES[i] + ">", text));
	}

	requestAnimationFrame(function (): void {
		requestAnimationFrame(function (): void {
			audioManager.initialize()
			.then(function (): void {
				setPlaying(false);

				stop.addEventListener("click", function (): void {
					setPlaying(false);
					audioManager.stop();
		
					return;
				});
		
				clear.addEventListener("click", function (): void {
					text["value"] = "";
					text.focus();
		
					return;
				});
		
				volume.addEventListener("input", function (): void {
					localStorage.setItem("volume", volume["value"]);
					audioManager.setGain(volume["valueAsNumber"] / 100);
		
					return;
				});
		
				const spaceAudioBuffer: AudioBuffer = audioManager.getBuffer(12288) as AudioBuffer;
		
				start.addEventListener("click", function (): void {
					if(!start["disabled"]) {
						setPlaying(true);
		
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
								if(!start["disabled"]) {
									return Promise.resolve();
								}
		
								if(current !== spaceAudioBuffer) {
									sleep(current["duration"] / 2)
									.then(function (): void {
										setImage(1);
		
										return;
									});
								}
								
								return audioManager.play(current)
								.then(function (): Promise<void> {
									setImage(0);
		
									return sleep(5);
								});
							});
						}, Promise.resolve())
						.then(function (): void {
							setPlaying(false);

							return;
						})
						.catch(alert);
					}
		
					return;
				});
		
				return;
			})
			.catch(alert);

			return;
		});

		return;
	});

	return;
})();