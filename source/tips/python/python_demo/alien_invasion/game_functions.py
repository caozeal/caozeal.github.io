import sys
from time import sleep

import pygame
from pygame.event import Event
from settings import Settings

from ship import Ship
from bullet import Bullet
from alien import Alien
from game_stats import GameStatus
from button import Button

def check_events(ai_settings:Settings, screen:pygame.Surface, stats:GameStatus, play_button:Button, ship:Ship, bullets:pygame.sprite.Group):
    """响应按键和鼠标事件"""
    for event in pygame.event.get(): # 事件循环
        if event.type == pygame.QUIT: # 退出事件
            sys.exit()
        elif event.type == pygame.KEYDOWN: # 按键按下事件
            check_keydown_events(event, ai_settings, screen, ship, bullets)
        elif event.type == pygame.KEYUP:
            check_keyup_events(event, ai_settings, screen, ship, bullets)
        elif event.type == pygame.MOUSEBUTTONDOWN: 
            mouse_x, mouse_y = pygame.mouse.get_pos()
            checke_play_button(stats, play_button, mouse_x, mouse_y)

def checke_play_button(stats:GameStatus, play_button:Button, mouse_x, mouse_y):
    """在玩家单机Play按钮时开始新游戏"""
    if play_button.rect.collidepoint(mouse_x, mouse_y):
        stats.game_active = True

def check_keyup_events(event:Event, ai_settings:Settings, screen:pygame.Surface, ship:Ship, bullets:pygame.sprite.Group):
    if event.key == pygame.K_RIGHT:
                # 停止向右移动飞船
        ship.moving_right = False
    elif event.key == pygame.K_LEFT:
                # 停止向左移动飞船
        ship.moving_left = False
    elif event.key == pygame.K_UP:
                # 停止向上移动飞船
        ship.moving_up = False
    elif event.key == pygame.K_DOWN:
                # 停止向下移动飞船
        ship.moving_down = False

def check_keydown_events(event:Event, ai_settings:Settings, screen:pygame.Surface, ship:Ship, bullets:pygame.sprite.Group):
    if event.key == pygame.K_RIGHT:
                # 向右移动飞船
        ship.moving_right = True
    elif event.key == pygame.K_LEFT:
                # 向左移动飞船
        ship.moving_left = True
    elif event.key == pygame.K_UP:
                # 向上移动飞船
        ship.moving_up = True
    elif event.key == pygame.K_DOWN:
                # 向下移动飞船
        ship.moving_down = True
    elif event.key == pygame.K_SPACE:
        fire_bullet(ai_settings, screen, ship, bullets)
    elif event.key == pygame.K_q:
        sys.exit()

def update_aliens(ai_settings:Settings, stats:GameStatus, screen:pygame.Surface, ship:Ship, aliens:pygame.sprite.Group, bullets:pygame.sprite.Group):
    """更新外星人群中所有外星人的位置"""
    check_fleet_edges(ai_settings, aliens)
    aliens.update()

    # 检测外星人和飞船之间的碰撞
    if pygame.sprite.spritecollideany(ship, aliens):
        ship_hit(ai_settings, stats, screen, ship, aliens, bullets)
    
    # 检查是否有外星人到达屏幕底端
    check_aliens_bottom(ai_settings, stats, screen, ship, aliens, bullets)

def check_aliens_bottom(ai_settings, stats, screen, ship, aliens, bullets):
    """检查是否有外星人到达了屏幕底端"""
    screen_rect = screen.get_rect()
    for alien in aliens.sprites():
        if alien.rect.bottom >= screen_rect.bottom:
            # 像飞船被撞到一样进行处理
            ship_hit(ai_settings, stats, screen, ship, aliens, bullets)
            break

def ship_hit(ai_settings:Settings, stats:GameStatus, screen:pygame.Surface, ship:Ship, aliens:pygame.sprite.Group, bullets:pygame.sprite.Group):
    """响应被外星人撞到的飞船"""
    if stats.ships_left > 0:
        stats.ships_left -= 1

        # 清空外星人列表和子弹列表
        aliens.empty()
        bullets.empty()

        # 创建一群新的外星人，并将飞船放到屏幕底端中央
        create_fleet(ai_settings, screen, ship, aliens)
        ship.center_ship()

        # 暂停
        sleep(0.5)
    else:
        stats.game_active = False

def check_fleet_edges(ai_settings:Settings, aliens:pygame.sprite.Group):
    """有外星人到达边缘时采取相应的措施"""
    for alien in aliens.sprites():
        if alien.check_edges():
            change_fleet_direction(ai_settings, aliens)
            break

def change_fleet_direction(ai_settings:Settings, aliens:pygame.sprite.Group):
    """将整群外星人下移，并改变它们的方向"""
    for alien in aliens.sprites():
        alien.rect.y += ai_settings.fleet_drop_speed
    ai_settings.fleet_direction *= -1

def fire_bullet(ai_settings, screen, ship, bullets):
    if len(bullets) < ai_settings.bullet_allowed:
            # 创建一颗子弹，并将其加入到编组bullets中
        new_bullet = Bullet(ai_settings, screen, ship)
        bullets.add(new_bullet)
            

def update_bullets(ai_settings, screen, ship, aliens:pygame.sprite.Group, bullets:pygame.sprite.Group):
    """更新子弹的位置，并删除已消失的子弹"""
    # 更新子弹的位置
    bullets.update()
    # 删除已消失的子弹
    for bullet in bullets.copy():
        if bullet.rect.bottom <= 0:
            bullets.remove(bullet)
    
    check_bullet_alien_collisions(ai_settings, screen, ship, aliens, bullets)

def check_bullet_alien_collisions(ai_settings, screen, ship, aliens:pygame.sprite.Group, bullets:pygame.sprite.Group):
    # 检查是否有子弹击中了外星人
    # 如果是这样，就删除相应的子弹和外星人
    collisions = pygame.sprite.groupcollide(bullets, aliens, True, True)

    if len(aliens) == 0:
        # 删除现有的子弹并新建一群外星人
        bullets.empty()
        create_fleet(ai_settings, screen, ship, aliens)


def update_screen(ai_settings:Settings, screen : pygame.Surface, stats:GameStatus, ship:Ship, aliens:pygame.sprite.Group, bullets:pygame.sprite.Group, play_button :Button):
    """更新屏幕上的图像，并切换到新屏幕"""
    # 每次循环时都重绘屏幕
    screen.fill(ai_settings.bg_color) # 填充背景色
    # 在飞船和外星人后面重绘所有子弹
    for bullet in bullets.sprites():
        bullet.draw_bullet()
    ship.blitme() # 绘制飞船
    aliens.draw(screen) # 绘制外星人

    # 如果游戏处于非活跃状态，就绘制Play按钮
    if not stats.game_active:
        play_button.draw_button()

    # 让最近绘制的屏幕可见
    pygame.display.flip() # 更新屏幕

def create_fleet(ai_settings, screen, ship, aliens):
    """创建外星人群"""
    # 创建一个外星人，并计算一行可容纳多少个外星人
    # 外星人间距为外星人宽度
    alien = Alien(ai_settings, screen)
    number_aliens_x = get_number_aliens_x(ai_settings, alien.rect.width)
    number_rows = get_number_rows(ai_settings, ship.rect.height, alien.rect.height)
    
    for row_number in range(number_rows):
        # 创建第一行外星人
        for alien_number in range(number_aliens_x):
            create_alien(ai_settings, screen, aliens, alien_number, row_number)


def get_number_rows(ai_settings, ship_height, alien_height):
    """计算屏幕可容纳多少行外星人"""
    available_space_y = (ai_settings.screen_height - 
        (3 * alien_height) - ship_height)
    number_rows = int(available_space_y / (2 * alien_height))
    return number_rows


def get_number_aliens_x(ai_settings, alien_width):
    available_space_x = ai_settings.screen_width - 2 * alien_width # 计算可用空间
    number_aliens_x = int(available_space_x / (2 * alien_width)) # 计算外星人数量
    return number_aliens_x

def create_alien(ai_settings, screen, aliens, alien_number, row_number=0):
    # 创建一个外星人并将其加入当前行
    alien = Alien(ai_settings, screen)
    alien.x = alien.rect.width + 2 * alien.rect.width * alien_number # 计算外星人位置
    alien.rect.x = alien.x # 设置外星人位置
    alien.rect.y = alien.rect.height + 2 * alien.rect.height * row_number # 设置外星人位置
    aliens.add(alien) # 添加到编组