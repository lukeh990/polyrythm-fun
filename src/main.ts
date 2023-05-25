const canvas = document.querySelector("#app") as HTMLCanvasElement,
  context = canvas.getContext("2d") as CanvasRenderingContext2D;

const button = document.querySelector("#sound") as HTMLButtonElement;

interface Arc {
  color: string;
  audio: HTMLAudioElement;
  nextImpactTime: number;
  velocity: number;
}

const settings = {
  startTime: new Date().getTime(),
  soundEnabled: false,
  volume: 0.02,
  oneFullLoop: 2 * Math.PI,
  baseLoops: 50,
  loopTime: 900,
};

document.onvisibilitychange = () => {
  settings.soundEnabled = false;
  button.innerText = "Sound Disabled";
};

button.onclick = () => {
  settings.soundEnabled = !settings.soundEnabled;
  button.innerText = settings.soundEnabled ? "Sound Enabled" : "Sound Disabled";
};

const colors = [
  "#D0E7F5",
  "#D9E7F4",
  "#D6E3F4",
  "#BCDFF5",
  "#B7D9F4",
  "#C3D4F0",
  "#9DC1F3",
  "#9AA9F4",
  "#8D83EF",
  "#AE69F0",
  "#D46FF1",
  "#DB5AE7",
  "#D911DA",
  "#D601CB",
  "#E713BF",
  "#F24CAE",
  "#FB79AB",
  "#FFB6C1",
  "#FED2CF",
  "#FDDFD5",
  "#FEDCD1",
];

const calculateNextImpactTime = (
  currentImpactTime: number,
  velocity: number
) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
};

const arcs: Arc[] = colors.map((color, index) => {
  const numberOfLoops = settings.baseLoops - index,
    velocity = (settings.oneFullLoop * numberOfLoops) / settings.loopTime;

  const audio = new Audio(
    `https://assets.codepen.io/1468070/vibraphone-key-${index}.wav`
  );
  audio.volume = settings.volume;

  return {
    color,
    audio,
    nextImpactTime: calculateNextImpactTime(settings.startTime, velocity),
    velocity,
  };
});

const draw = () => {
  // Ensure canvas stays the right size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const currentTime = new Date().getTime(),
    elapsedTime = (currentTime - settings.startTime) / 1000;

  const start = {
    x: canvas.width * 0.3,
    y: canvas.height * 0.5,
  };

  const end = {
    x: canvas.width * 0.7,
    y: canvas.height * 0.5,
  };

  const center = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
  };

  const length = end.x - start.x,
    initialArcRadius = length * 0.05,
    spacing = (length / 2 - initialArcRadius) / arcs.length;

  context.lineWidth = canvas.width / 500;
  context.strokeStyle = "white";

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();

  arcs.forEach((arc, index) => {
    const arcRadius = initialArcRadius + index * spacing;

    context.strokeStyle = arc.color;

    context.beginPath();
    context.arc(center.x, center.y, arcRadius, 0, 2 * Math.PI);
    context.stroke();

    const maxAngle = 2 * Math.PI,
      distance = Math.PI + elapsedTime * arc.velocity,
      modDistance = distance % maxAngle;

    const x = center.x + arcRadius * Math.cos(modDistance),
      y = center.y + arcRadius * Math.sin(modDistance);

    context.fillStyle = "white";
    context.beginPath();
    context.arc(x, y, length * 0.0065, 0, 2 * Math.PI);
    context.fill();

    if (currentTime >= arc.nextImpactTime) {
      if (settings.soundEnabled) {
        arc.audio.play();
      }
      arc.nextImpactTime = calculateNextImpactTime(
        arc.nextImpactTime,
        arc.velocity
      );
    }
  });

  // Calls draw function on every frame
  requestAnimationFrame(draw);
};

button.innerText = settings.soundEnabled ? "Sound Enabled" : "Sound Disabled";

draw();
