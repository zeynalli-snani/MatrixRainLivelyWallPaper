const config = {
  fontSize: 16,
  color: "#00FF00",
  speed: 1,
  trailOpacity: 0.05,
  characters:
    "アァイイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  backgroundColor: "black",
};

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

let columns;
let drops;
let bursts = [];
const chars = config.characters.split("");

let mouseX = -1;
let mouseY = -1;
let swirlAngle = 0; // radian

function initMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  columns = Math.floor(canvas.width / config.fontSize);
  drops = Array(columns).fill(1);
}

function drawMatrixRain() {
  ctx.fillStyle = `rgba(0, 0, 0, ${config.trailOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = config.color;
  ctx.font = `${config.fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rawX = i * config.fontSize;
    const rawY = drops[i] * config.fontSize;

    const rawDX = rawX - cx;
    const rawDY = rawY - cy;

    const cosA = Math.cos(swirlAngle);
    const sinA = Math.sin(swirlAngle);

    const x = cx + (rawDX * cosA - rawDY * sinA);
    const y = cy + (rawDX * sinA + rawDY * cosA);

    swirlAngle *= 0.9999;

    const mouseDX = x - mouseX;
    const mouseDY = y - mouseY;
    const distanceSq = mouseDX * mouseDX + mouseDY * mouseDY;

    const threshold = config.fontSize * 4;
    if (distanceSq < threshold * threshold) {
      ctx.fillStyle = "#FFFFFF"; // white glow
      ctx.font = `${config.fontSize + 4}px monospace`;
    } else {
      ctx.fillStyle = config.color;
      ctx.font = `${config.fontSize}px monospace`;
    }

    ctx.fillText(text, x, y);

    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += config.speed;
  }
  bursts = bursts.filter((burst) => burst.alpha > 0.01);

  for (const burst of bursts) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * burst.radius;

      // convert polar coordinates to Cartesian
      const x = burst.x + r * Math.cos(angle);
      const y = burst.y + r * Math.sin(angle);

      const char = chars[Math.floor(Math.random() * chars.length)];

      ctx.fillStyle = `rgba(255, 0, 255, ${burst.alpha})`; // magenta bursts
      ctx.font = `${config.fontSize}px monospace`;
      ctx.fillText(char, x, y);
    }

    burst.radius += 10;
    burst.alpha *= 0.95;
  }
}

function animate() {
  drawMatrixRain();
  requestAnimationFrame(animate);
}

function livelyPropertyListener(name, val) {
  console.log(`livelyPropertyListener: ${name} = ${val}`);

  switch (name) {
    case "fontSize":
      config.fontSize = val;
      ctx.font = `${config.fontSize}px monospace`;
      initMatrix();
      break;
    case "color":
      config.color = val;
      break;
    case "speed":
      config.speed = val;
      break;
    case "trailOpacity":
      config.trailOpacity = val;
      break;
    case "characters":
      config.characters = val.length > 0 ? val : "01";
      chars.length = 0;
      chars.push(...config.characters.split(""));
      break;
  }
}

window.addEventListener("resize", () => {
  initMatrix();
});

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener("click", (e) => {
  bursts.push({
    x: e.clientX,
    y: e.clientY,
    radius: 0,
    maxRadius: 100,
    alpha: 1.0,
  });
});

window.addEventListener("keydown", (e) => {
  const x = Math.random() * canvas.width;
  const y = canvas.height - config.fontSize * 2;
  bursts.push({
    x,
    y,
    radius: 0,
    alpha: 1.0,
    color: "#FF00FF",
  });
});

window.addEventListener("wheel", (e) => {
  swirlAngle += e.deltaY * 0.001;
});

window.addEventListener("mouseleave", () => {
  mouseX = -1;
  mouseY = -1;
});

initMatrix();
animate();
