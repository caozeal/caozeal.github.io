// Set up the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set up the game variables
let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let food = { x: 5, y: 5 };
let direction = "right";
let score = 0;
const gridSize = 8; // Change this to adjust the size of the grid

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
  head.x >= food.x - 8 &&
  head.x < food.x + 8 &&
  head.y >= food.y - 8 &&
  head.y < food.y + 8
) {
  score++;
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
  snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
) {
  clearInterval(intervalId);
  alert(`Game over! Your score was ${score}.`);
}

  // Draw the game board
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "green";
snake.forEach((segment) => {
  ctx.fillRect(segment.x, segment.y, 8, 8); // Increase the size of the snake to 4x4 pixels
});
ctx.fillStyle = "red";
ctx.fillRect(food.x, food.y, 8, 8); // Increase the size of the food to 4x4 pixels
}

let intervalId = setInterval(gameLoop, 10); // Decrease the interval to 50 milliseconds
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