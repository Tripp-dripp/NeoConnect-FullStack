import pygame
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Cookie Clicker")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)

# Load and set up the cookie image
cookie_img = pygame.image.load("images/playerCookie.png")
cookie_rect = cookie_img.get_rect(center=(WIDTH // 2, HEIGHT // 2))

# Cookie growth settings
initial_size = 100
max_size = 300
growth_step = 10

# Variables to keep track of score, cookie size, and username
score = 0
cookie_size = initial_size
username = ""

# Font for displaying text
font = pygame.font.Font(None, 36)

def draw_score():
    score_text = font.render(f"Score: {score}", True, BLACK)
    screen.blit(score_text, (10, 10))

def draw_cookie():
    scaled_cookie = pygame.transform.scale(cookie_img, (cookie_size, cookie_size))
    cookie_rect = scaled_cookie.get_rect(center=(WIDTH // 2, HEIGHT // 2))
    screen.blit(scaled_cookie, cookie_rect)

def draw_username():
    username_text = font.render(f"Player: {username}", True, BLACK)
    screen.blit(username_text, (10, 50))

def input_username():
    global username
    input_active = True
    user_input = ""
    
    while input_active:
        screen.fill(WHITE)
        
        # Display prompt
        prompt_text = font.render("Enter your username:", True, BLACK)
        screen.blit(prompt_text, (WIDTH // 2 - prompt_text.get_width() // 2, HEIGHT // 2 - 50))
        
        # Display user input text
        input_rect = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2, 200, 50)
        pygame.draw.rect(screen, GRAY, input_rect)
        user_text = font.render(user_input, True, BLACK)
        screen.blit(user_text, (input_rect.x + 10, input_rect.y + 10))

        pygame.display.flip()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    username = user_input
                    input_active = False
                elif event.key == pygame.K_BACKSPACE:
                    user_input = user_input[:-1]
                else:
                    user_input += event.unicode

# Main game function
def main_game():
    global score, cookie_size
    running = True
    while running:
        screen.fill(WHITE)
        draw_score()
        draw_username()
        draw_cookie()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if cookie_rect.collidepoint(event.pos):
                    # Increase cookie size and score on click
                    if cookie_size < max_size:
                        cookie_size += growth_step
                    score += 1

        pygame.display.flip()
        pygame.time.Clock().tick(60)

    pygame.quit()
    sys.exit()

# Run the username input screen, then start the main game
input_username()
main_game()
