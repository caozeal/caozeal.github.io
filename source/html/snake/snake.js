// Set up the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restart");
const foodImage = new Image();
foodImage.src = "resource/apple.jpg";

// Set up the game variables
let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
let food = { x: 300, y: 300 };
let direction = "right";
let score = 0;
const gridSize = 16; // Change this to adjust the size of the grid
// 在 JavaScript 文件中添加以下代码
let scoreElement = document.getElementById("score");

// Set up the game loop
function gameLoop() {
  // Move the snake
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

  // Check for collision with food
  if (
    head.x >= food.x - gridSize &&
    head.x < food.x + gridSize &&
    head.y >= food.y - gridSize &&
    head.y < food.y + gridSize
  ) {
    score++;
    // 在分数更新时更新元素的文本内容
    scoreElement.textContent = `Score: ${score}`;
    food.x = Math.floor(Math.random() * canvas.width);
    food.y = Math.floor(Math.random() * canvas.height);
    let newHead = { x: head.x, y: head.y };
    switch (direction) {
      case "up":
        newHead.y -= gridSize;
        break;
      case "down":
        newHead.y += gridSize;
        break;
      case "left":
        newHead.x -= gridSize;
        break;
      case "right":
        newHead.x += gridSize;
        break;
    }
    snake.unshift(newHead); // Add the new head to the front of the snake
    head = newHead;
  } else {
    snake.pop();
  }

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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "green";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  // Draw the game board

  // Draw the border

  ctx.fillStyle = "green";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize); // Increase the size of the snake to 4x4 pixels
  });
  ctx.drawImage(foodImage, food.x, food.y, 16, 16);
}

function gameOver() {
  // 显示重生按钮
  restartButton.style.display = "block";
}

function resetGame() {
  // 隐藏重生按钮
  restartButton.style.display = "none";

  // 重置游戏状态
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  food = { x: 300, y: 300 };
  direction = "right";
  score = 0;
  scoreElement.textContent = `Score: ${score}`;
  intervalId = setInterval(gameLoop, 5); 
}

let intervalId = setInterval(gameLoop, 5); // Decrease the interval to 50 milliseconds
// Set up the keyboard controls
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      direction = "up";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
    case "ArrowRight":
      direction = "right";
      break;
  }
});

// 在 JavaScript 文件中添加以下代码
let upButton = document.getElementById("up");
let downButton = document.getElementById("down");
let leftButton = document.getElementById("left");
let rightButton = document.getElementById("right");

// 在 JavaScript 文件中添加以下代码
upButton.addEventListener("touchstart", function() {
  if (direction !== "down") {
    direction = "up";
  }
});

downButton.addEventListener("touchstart", function() {
  if (direction !== "up") {
    direction = "down";
  }
});

leftButton.addEventListener("touchstart", function() {
  if (direction !== "right") {
    direction = "left";
  }
});

rightButton.addEventListener("touchstart", function() {
  if (direction !== "left") {
    direction = "right";
  }
});

restartButton.addEventListener("click", function() {
  // 重置游戏状态
  resetGame();
});
