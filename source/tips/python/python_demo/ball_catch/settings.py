

class Settings():
    
    def __init__(self) -> None:
        """初始化游戏的设置"""
        self.ball_speed_factor = 1.5
        self.ball_width = 20
        self.ball_height = 20
        self.ball_color = (255, 0, 0)

        self.bg_color = (50, 50, 50)

        self.paddle_speed_factor = 1.5
        self.paddle_width = 200
        self.paddle_height = 20
        self.paddle_color = (0, 255, 0)