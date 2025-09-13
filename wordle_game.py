import random

class WordleGame:
    def __init__(self):
        # 20个常用五字母英语单词作为词库
        self.word_bank = [
            "APPLE", "BRAIN", "CHAIR", "DANCE", "EARTH",
            "FOCUS", "GRAND", "HAPPY", "IDEAS", "JOKER",
            "KNIFE", "LIGHT", "MAGIC", "NIGHT", "OCEAN",
            "PEACE", "QUICK", "RIVER", "SMART", "TIGER"
        ]
        self.target_word = ""
        self.max_attempts = 7
        self.current_attempt = 0
        self.game_over = False
        
    def start_game(self):
        """开始新游戏"""
        self.target_word = random.choice(self.word_bank)
        self.current_attempt = 0
        self.game_over = False
        print("欢迎来到Wordle游戏！")
        print("请猜测一个5个字母的英语单词")
        print(f"您有{self.max_attempts}次机会")
        print("-" * 50)
        
    def is_valid_input(self, user_input):
        """检查用户输入是否有效"""
        if not user_input:
            return False
        # 检查是否为5个字母
        if len(user_input) != 5:
            return False
        # 检查是否只包含字母
        if not user_input.isalpha():
            return False
        return True
    
    def check_guess(self, guess):
        """检查猜测结果"""
        guess = guess.upper()
        
        # 检查输入格式
        if not self.is_valid_input(guess):
            print("您的输入格式不合规")
            return False
            
        # 如果猜中了
        if guess == self.target_word:
            print("您猜中了！恭喜您！")
            self.game_over = True
            return True
            
        # 分析字母匹配情况
        correct_letters = []  # 位置正确的字母
        wrong_position_letters = []  # 存在但位置错误的字母
        target_letters = list(self.target_word)
        guess_letters = list(guess)
        
        # 首先标记位置正确的字母
        for i in range(5):
            if guess_letters[i] == target_letters[i]:
                correct_letters.append(f"{guess_letters[i]}(位置{i+1})")
                target_letters[i] = None  # 标记为已使用
                guess_letters[i] = None   # 标记为已使用
        
        # 然后检查位置错误但存在的字母
        for i in range(5):
            if guess_letters[i] is not None:  # 如果这个位置还没被处理
                if guess_letters[i] in target_letters:
                    wrong_position_letters.append(guess_letters[i])
                    # 从目标单词中移除这个字母（避免重复计算）
                    target_letters[target_letters.index(guess_letters[i])] = None
        
        # 输出结果
        if correct_letters:
            print(f"位置正确的字母: {', '.join(correct_letters)}")
        if wrong_position_letters:
            print(f"存在但位置错误的字母: {', '.join(set(wrong_position_letters))}")
        if not correct_letters and not wrong_position_letters:
            print("没有匹配的字母")
            
        return False
    
    def play_game(self):
        """主游戏循环"""
        self.start_game()
        
        while not self.game_over and self.current_attempt < self.max_attempts:
            self.current_attempt += 1
            print(f"\n第{self.current_attempt}次猜测 (剩余{self.max_attempts - self.current_attempt}次):")
            
            user_input = input("请输入您的猜测: ").strip()
            
            if self.check_guess(user_input):
                break
                
            if self.current_attempt >= self.max_attempts:
                print(f"\n游戏结束！正确答案是: {self.target_word}")
                self.game_over = True

def main():
    """主函数"""
    game = WordleGame()
    
    while True:
        game.play_game()
        
        # 询问是否继续游戏
        play_again = input("\n是否继续游戏？(y/n): ").strip().lower()
        if play_again != 'y':
            print("谢谢游戏！再见！")
            break

if __name__ == "__main__":
    main()
