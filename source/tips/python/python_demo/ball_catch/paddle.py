import pygame
from pygame.sprite import Sprite

from settings import Settings

class Paddle(Sprite):

    def __init__(self, settings:Settings, screen:pygame.Surface):
        super().__init__()
        self.screen = screen

        self.rect = pygame.Rect(0, 0, settings.paddle_width, settings.paddle_height)
        self.rect.x = (screen.get_width() - settings.paddle_width) / 2
        self.rect.y = screen.get_height() - settings.paddle_height
        self.color = settings.paddle_color
        self.speed_factor = settings.paddle_speed_factor

        self.moving_right = False
        self.moving_left = False

        self.life = 5
        self.score = 0


    def update(self):
        if self.moving_right and self.rect.right < self.screen.get_width():
            self.rect.x += self.speed_factor
        if self.moving_left and self.rect.left > 0:
            self.rect.x -= self.speed_factor

    def draw(self):
        pygame.draw.rect(self.screen, self.color, self.rect)
