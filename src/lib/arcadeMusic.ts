export const ARCADE_MUSIC_URL = "/sounds/celesta-quest.mp3";
export const ARCADE_MUSIC_VOLUME = 0.18;

// Blend the end into the beginning without modifying the supplied MP3. The
// resulting buffer also wraps smoothly if future rounds exceed the track length.
export function crossfadeLoop(context: BaseAudioContext, input: AudioBuffer) {
  const fade = Math.min(
    Math.round(input.sampleRate * 0.15),
    Math.floor(input.length / 2),
  );
  if (!fade) return input;
  const output = context.createBuffer(
    input.numberOfChannels,
    input.length - fade,
    input.sampleRate,
  );
  for (let channel = 0; channel < input.numberOfChannels; channel++) {
    const source = input.getChannelData(channel);
    const target = output.getChannelData(channel);
    target.set(source.subarray(fade));
    for (let frame = 0; frame < fade; frame++) {
      const weight = (frame + 1) / fade;
      target[output.length - fade + frame] =
        source[input.length - fade + frame] * (1 - weight) +
        source[frame] * weight;
    }
  }
  return output;
}

export class ArcadeMusic {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private loading: Promise<AudioBuffer> | null = null;
  private source: AudioBufferSourceNode | null = null;
  private offset = 0;
  private startedAt = 0;
  private revision = 0;
  private disposed = false;
  private abort = new AbortController();

  constructor(
    private createContext = () => new AudioContext(),
    private load = async (signal: AbortSignal) => {
      const response = await fetch(ARCADE_MUSIC_URL, { signal });
      if (!response.ok) throw new Error("Music could not be loaded");
      return response.arrayBuffer();
    },
  ) {}

  async play() {
    if (this.disposed || this.source) return;
    const revision = ++this.revision;
    const context = (this.context ??= this.createContext());
    if (!this.gain) {
      this.gain = context.createGain();
      this.gain.connect(context.destination);
    }
    // Resume synchronously in the click/keyboard handler, before fetching. This
    // preserves the user gesture required by browser autoplay policies.
    const resumed = context.resume();
    this.loading ??= this.load(this.abort.signal)
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => crossfadeLoop(context, buffer));
    let buffer: AudioBuffer;
    try {
      [, buffer] = await Promise.all([resumed, this.loading]);
    } catch (error) {
      this.loading = null;
      if (!this.disposed && revision === this.revision) throw error;
      return;
    }
    if (this.disposed || revision !== this.revision) return;
    this.buffer = buffer;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.gain);
    this.gain.gain.cancelScheduledValues(context.currentTime);
    this.gain.gain.setValueAtTime(0, context.currentTime);
    this.gain.gain.linearRampToValueAtTime(
      ARCADE_MUSIC_VOLUME,
      context.currentTime + 0.12,
    );
    this.startedAt = context.currentTime;
    source.start(0, this.offset % buffer.duration);
    this.source = source;
  }

  pause() {
    ++this.revision;
    if (!this.source || !this.context || !this.buffer) return;
    this.offset =
      (this.offset + this.context.currentTime - this.startedAt) %
      this.buffer.duration;
    this.source.stop();
    this.source.disconnect();
    this.source = null;
  }

  restart() {
    this.pause();
    this.offset = 0;
  }

  dispose() {
    this.pause();
    this.disposed = true;
    this.abort.abort();
    this.gain?.disconnect();
    void this.context?.close().catch(() => {});
    this.buffer = null;
    this.loading = null;
  }
}
