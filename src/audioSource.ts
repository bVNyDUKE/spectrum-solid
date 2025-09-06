import { createSignal } from "solid-js";

const [rawData, setRawData] = createSignal<number[]>([]);

export const startFromAudioSource = (
  event: Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
  },
) => {
  const files = event.target.files;
  if (!files || files?.length !== 1) {
    return;
  }
  const file = files[0];
  const audioUrl = URL.createObjectURL(file);
  const audio = new Audio(audioUrl);
  const context = new AudioContext({
    latencyHint: "playback",
    sampleRate: 44100,
  });

  const source = context.createMediaElementSource(audio);
  source.connect(context.destination);

  const analyzer = context.createAnalyser();
  analyzer.fftSize = 512;

  source.connect(analyzer);

  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const update = () => {
    analyzer.getByteFrequencyData(dataArray);
    const orig = Array.from(dataArray);
    setRawData(orig.toReversed().concat(orig));
    requestAnimationFrame(update);
  };

  audio.play();
  requestAnimationFrame(update);
};

export { rawData };
