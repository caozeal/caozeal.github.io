// Set up the canvas
const isTouchDevice = "ontouchstart" in document.documentElement;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restart");
const foodImage = new Image();
foodImage.src = "resource/apple.png";

// Set up the canvas size
const width = Math.min(window.innerWidth, window.innerHeight);
canvas.width = width * window.devicePixelRatio;
canvas.height = width * window.devicePixelRatio;
canvas.style.width = width * 0.95 + "px";
canvas.style.height = width * 0.95 + "px";
// Set up the game variables
let snake = [{ x: 10, y: 10 }];
let food = { x: 100, y: 100 };
let direction = "right";
let score = 0;
const gridSize = parseInt(width / 30); // Change this to adjust the size of the grid
// 在 JavaScript 文件中添加以下代码
let scoreElement = document.getElementById("score");
// Set up the speed control
let speed = 5;
let speedControl = document.getElementById("speed-control");
speedControl.addEventListener("input", () => {
  speed = 10 - speedControl.value;
});

// Set up the game loop
function gameLoop() {
  // Move the snake
  let head = addHead();

  // Check for collision with walls or self
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver();
    clearInterval(intervalId);
    alert(`Game over! Your score was ${score}.`);
  }

  // Check for collision with food
  if (
    head.x >= food.x - gridSize &&
    head.x < food.x + gridSize &&
    head.y >= food.y - gridSize &&
    head.y < food.y + gridSize
  ) {
    score++;
    for (let i = 0; i < gridSize - 1; i++) {
      head = addHead();
      ctx.fillStyle = "green";
      ctx.fillRect(head.x, head.y, gridSize, gridSize);
    }
    // 在分数更新时更新元素的文本内容
    scoreElement.textContent = `Score: ${score}`;
    ctx.clearRect(food.x, food.y, gridSize, gridSize);
    food.x = Math.floor(Math.random() * canvas.width);
    food.y = Math.floor(Math.random() * canvas.height);
  } else {
    // Remove the tail from the end of the snake
    let tail = snake.pop();

    // Clear the tail from the canvas
    ctx.clearRect(tail.x, tail.y, gridSize, gridSize);
    tail = snake[snake.length - 1];
    ctx.fillStyle = "green";
    ctx.fillRect(tail.x, tail.y, gridSize, gridSize);
  }
  // Draw the game board

  // Draw the snake
  ctx.fillStyle = "green";
  ctx.fillRect(head.x, head.y, gridSize, gridSize);

  ctx.drawImage(foodImage, food.x, food.y, gridSize, gridSize);
}

function addHead() {
  let head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }
  snake.unshift(head);
  return head;
}

function gameOver() {
  // 显示重生按钮
  restartButton.style.display = "block";
}

function resetGame() {
  // 隐藏重生按钮
  restartButton.style.display = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "green";
ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // 重置游戏状态
  snake = [{ x: 10, y: 10 }];
  food = { x: 100, y: 100 };
  direction = "right";
  score = 0;
  scoreElement.textContent = `Score: ${score}`;
  intervalId = setInterval(gameLoop, speed);
}

let intervalId = setInterval(gameLoop, speed); // Decrease the interval to 50 milliseconds
ctx.strokeStyle = "green";
ctx.strokeRect(0, 0, canvas.width, canvas.height);
// Set up the keyboard controls
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      if (direction !== "down") {
        direction = "up";
      }
      break;
    case "ArrowDown":
      if (direction !== "up") {
        direction = "down";
      }
      break;
    case "ArrowLeft":
      if (direction !== "right") {
        direction = "left";
      }
      break;
    case "ArrowRight":
      if (direction !== "left") {
        direction = "right";
      }
      break;
  }
});

// 在 JavaScript 文件中添加以下代码
let upButton = document.getElementById("up");
let downButton = document.getElementById("down");
let leftButton = document.getElementById("left");
let rightButton = document.getElementById("right");

// 监听点击事件
if (isTouchDevice) {
  // 移动端设备，使用touchstart事件
  // 在 JavaScript 文件中添加以下代码
  upButton.addEventListener("touchstart", function () {
    if (direction !== "down") {
      direction = "up";
    }
  });

  downButton.addEventListener("touchstart", function () {
    if (direction !== "up") {
      direction = "down";
    }
  });

  leftButton.addEventListener("touchstart", function () {
    if (direction !== "right") {
      direction = "left";
    }
  });

  rightButton.addEventListener("touchstart", function () {
    if (direction !== "left") {
      direction = "right";
    }
  });

  restartButton.addEventListener("touchstart", function () {
    // 重置游戏状态
    resetGame();
  });
} else {
  // PC端设备，使用mousedown事件
  // 在 JavaScript 文件中添加以下代码
  upButton.addEventListener("mousedown", function () {
    if (direction !== "down") {
      direction = "up";
    }
  });

  downButton.addEventListener("mousedown", function () {
    if (direction !== "up") {
      direction = "down";
    }
  });

  leftButton.addEventListener("mousedown", function () {
    if (direction !== "right") {
      direction = "left";
    }
  });

  rightButton.addEventListener("mousedown", function () {
    if (direction !== "left") {
      direction = "right";
    }
  });

  restartButton.addEventListener("mousedown", function () {
    // 重置游戏状态
    resetGame();
  });
}
