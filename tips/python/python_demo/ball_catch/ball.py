from random import Random
import pygame
from pygame.sprite import Sprite

from settings import Settings

class Ball(Sprite):

    def __init__(self, settings:Settings, screen:pygame.Surface):
        super().__init__()
        self.screen = screen
        self.settings = settings
        self.renew()


    def renew(self):
        self.rect = pygame.Rect(0, 0, self.settings.ball_width, self.settings.ball_height)
        self.rect.x = Random().randint(0, self.screen.get_width() - self.settings.ball_width)
        self.speed_factor = self.settings.ball_speed_factor
        self.color = self.settings.ball_color


    def update(self):
        if self.rect.y > self.screen.get_height():
            return -1
        
        self.rect.y += self.speed_factor


    def draw(self):
        pygame.draw.rect(self.screen, self.color, self.rect)
