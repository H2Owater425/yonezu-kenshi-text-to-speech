export class AudioManager<T> {
	#context: AudioContext;
	#sources: T[];
	#buffers: Map<T, AudioBuffer>;

	constructor(sources: T[]) {
		this.#context = new AudioContext();
		this.#sources = sources;
		this.#buffers = new Map<T, AudioBuffer>();
	}

	public initialize(): Promise<void> {
		const promises: Promise<void>[] = [];

		for(let i: number = 0; i < this.#sources["length"]; i++) {
			promises.push(fetch("/audios/" + this.#sources[i] + ".wav")
			.then(function (response: Response): Promise<ArrayBuffer> {
				return response.arrayBuffer();
			})
			.then((function (this: AudioManager<T>, arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
				return this.#context.decodeAudioData(arrayBuffer);
			}).bind(this))
			.then((function (this: AudioManager<T>, audioBuffer: AudioBuffer): void {
				if(this.#buffers.has(this.#sources[i])) {
					throw new Error("Source must be unique " + this.#sources[i]);
				}

				this.#buffers.set(this.#sources[i], audioBuffer);

				return;
			}).bind(this))
			.catch((function (this: AudioManager<T>, error: unknown): void {
				console.log(this.#sources[i])

				throw error;
			}).bind(this)));
		}

		return Promise.all(promises)
		.then(function (): void {
			//console.log("AudioManager initialized");

			return;
		})
		.catch((function (this: AudioManager<T>, error: unknown): void {
			this.#buffers.clear();

			throw error;
		}).bind(this));
	}

	public getBuffer(source: T): AudioBuffer | undefined {
		return this.#buffers.get(source);
	}

	public hasBuffer(source: T): boolean {
		return this.#buffers.has(source);
	}

	public play(buffer: AudioBuffer): Promise<void> {
		return new Promise<void>((function (this: AudioManager<T>, resolve: () => void, reject: (reason: unknown) => void): void {
			try {
				const bufferSource: AudioBufferSourceNode = this.#context.createBufferSource();
				bufferSource["buffer"] = buffer;
				
				bufferSource.connect(this.#context["destination"]);
				bufferSource.addEventListener("ended", resolve);
				bufferSource.start();
			} catch(error: unknown) {
				reject(error);
			}
	
			return;
		}).bind(this));
	}
}

export const CODES: number[] = [12288, 12290, 12354, 12356, 12358, 12360, 12362, 12363, 12364, 12366, 12367, 12368, 12369, 12370, 12371, 12372, 12373, 12374, 12375, 12376, 12377, 12378, 12379, 12380, 12381, 12382, 12383, 12384, 12385, 12386, 12387, 12388, 12389, 12390, 12391, 12392, 12393, 12394, 12395, 12396, 12397, 12398, 12399, 12400, 12401, 12402, 12403, 12404, 12405, 12406, 12407, 12408, 12409, 12410, 12411, 12412, 12413, 211069, 12414, 12416, 12417, 12415, 211070, 12420, 12418, 12422, 211079, 12424, 211080, 12426, 12427, 12428, 12429, 12425, 12431, 211089, 211090, 12434, 12435, 211099, 211101, 211102, 211106, 211107, 211108, 211111, 211112, 211119, 211121, 211122, 211130, 211131, 211133, 211134, 211138, 211139, 211140, 211143, 211144, 211151, 211153, 211154, 211162, 211163, 211170, 211171, 211172, 211183, 211194, 65281, 65311];

export const SIGNATURES: string[] = ["A_BEAUTIFUL_STAR", "BYE_BYE", "DAREDA_DAREDA", "DORYOKU", "HAPPY", "KA", "KASU", "KYOSHIKI_MURASAKI", "MIRAI", "NA"];

for(let i: number = 0; i < SIGNATURES["length"]; i++) {
	CODES.push(-i);
}