import sys
import pygame

from ball import Ball
from settings import Settings
from paddle import Paddle

def run_game():
    pygame.init()
    screen = pygame.display.set_mode((1200, 800))

    pygame.display.set_caption("Ball Catch")

    settings = Settings()
    ball = Ball(settings=settings, screen=screen)
    paddle = Paddle(settings=settings, screen=screen)
    paddles = pygame.sprite.Group()
    paddles.add(paddle)

    while True:
        check_events(paddle=paddle)

        life = ball.update()
        if life:
            ball.renew()
            paddle.life += life
        paddle.update()
        collisions = pygame.sprite.spritecollide(ball, paddles, False)

        if collisions:
            paddle.score += 1
            ball.renew()

        update_screen(screen=screen, settings=settings, ball=ball, paddle=paddle)

def check_events(paddle:Paddle):
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()
        if event.type == pygame.KEYDOWN:
            check_keydown_events(event=event, paddle=paddle)
        if event.type == pygame.KEYUP:
            check_keyup_events(event=event, paddle=paddle)

def check_keyup_events(event:pygame.event.Event, paddle:Paddle):
    if event.key == pygame.K_RIGHT:
        paddle.moving_right = False
    elif event.key == pygame.K_LEFT:
        paddle.moving_left = False
        
def check_keydown_events(event:pygame.event.Event, paddle:Paddle):
    if event.key == pygame.K_RIGHT:
        paddle.moving_right = True
    elif event.key == pygame.K_LEFT:
        paddle.moving_left = True

def update_screen(screen:pygame.Surface, settings:Settings, ball:Ball, paddle:Paddle):
    screen.fill(settings.bg_color)
    ball.draw()
    paddle.draw()
    pygame.display.flip()

run_game()