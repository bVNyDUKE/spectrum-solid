import {
  type Component,
  createMemo,
  createSignal,
  createEffect,
} from "solid-js";
import { arc, interpolateSinebow, interpolateInferno, select } from "d3";

import { startFromFile, rawData } from "./audioSource";

const arcBuilder = arc();

const RadialGraph: Component<{
  color: (value: number) => string;
  scale: number;
  id: string;
}> = ({ color, scale, id }) => {
  const computed = createMemo(() => {
    const data = rawData();

    let total = 0;
    let highCount = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i];
      if (data[i] > 32) {
        highCount++;
      }
    }
    const intensity = highCount / data.length;

    const paths: {
      path: string;
      color: string;
    }[] = [];

    const range = 1.0 + intensity;
    const rangeInRadians = range * Math.PI;
    const startAngle = -(rangeInRadians / 2);
    let currentAngle = startAngle;

    for (const d of data) {
      const angle = rangeInRadians * (d / total);
      const path = arcBuilder({
        innerRadius: 50 - ((d + 10) / 255) * 35,
        outerRadius: 50 + ((d + 10) / 255) * 35,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      });
      path &&
        paths.push({
          path,
          color: color(d / 255),
        });
      currentAngle += angle;
    }

    return { paths, intensity };
  });

  createEffect(() => {
    select(`#${id}`)
      .selectAll("path")
      .data(computed().paths)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => d.path)
            .attr("fill", (d) => d.color),
        (update) =>
          update.attr("d", (d) => d.path).attr("fill", (d) => d.color),
        (exit) => exit.remove(),
      );
  });

  return <g id={id} transform={`scale(${computed().intensity * scale + 1})`} />;
};

const App: Component = () => {
  const [uploaded, setUploaded] = createSignal(false);

  const handleFileSelect = async (
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
    const buf = await file.arrayBuffer();
    const audioUrl = URL.createObjectURL(files[0]);
    const audio = new Audio(audioUrl);
    audio.play();
    setUploaded(true);
    startFromFile(buf);
  };

  return (
    <div>
      {uploaded() ? (
        <div style="width: 100vw; height: 100vh;">
          <svg
            width="100%"
            height="100%"
            viewBox="-100 -100 200 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <RadialGraph id="sinebow" color={interpolateSinebow} scale={2.5} />
            <RadialGraph id="inferno" color={interpolateInferno} scale={1.5} />
          </svg>
        </div>
      ) : (
        <div style="display: flex; gap: 10px; align-items: center; justify-content: center; width: 100vw; height: 100vh;">
          <label for="audiofile" style="color: white">
            Choose an audio file:
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            id="audiofile"
            name="audiofile"
            accept="audio/mp3"
          />
        </div>
      )}
    </div>
  );
};

export default App;
