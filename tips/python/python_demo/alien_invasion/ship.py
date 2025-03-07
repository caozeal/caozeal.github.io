import pygame

from settings import Settings

class Ship():

    def __init__(self, ai_settings:Settings, screen: pygame.Surface):
        """初始化飞船并设置其初始位置"""
        self.screen = screen
        self.ai_settings = ai_settings

        # 加载飞船图像并获取其外接矩形
        self.image = pygame.image.load('images/ship.bmp')
        self.rect = self.image.get_rect()
        self.screen_rect = screen.get_rect()
        
        # 将每艘新飞船放在屏幕底部中央
        self.rect.centerx = self.screen_rect.centerx
        self.rect.bottom = self.screen_rect.bottom

        # 在飞船的属性centerx中存储小数值
        self.center = float(self.rect.centerx)

        # 移动标志
        self.moving_right: bool = False
        self.moving_left: bool = False
        self.moving_up: bool = False
        self.moving_down: bool = False

    def blitme(self):
        """在指定位置绘制飞船"""
        self.screen.blit(self.image, self.rect)

    def update(self):
        """根据移动标志调整飞船的位置"""
        if self.moving_right and self.rect.right < self.screen_rect.right: # 防止飞船移动出屏幕
            self.center += self.ai_settings.ship_speed_factor
        if self.moving_left and self.rect.left > 0: # 防止飞船移动出屏幕
            self.center -= self.ai_settings.ship_speed_factor
        if self.moving_up and self.rect.top > 0: # 防止飞船移动出屏幕
            self.rect.bottom -= self.ai_settings.ship_speed_factor
        if self.moving_down and self.rect.bottom < self.screen_rect.bottom:
            self.rect.bottom += self.ai_settings.ship_speed_factor

        # 根据self.center更新rect对象
        self.rect.centerx = self.center

    def center_ship(self):
        """让飞船在屏幕上居中"""
        self.center = self.screen_rect.centerx
        self.rect.y = self.screen_rect.bottom
