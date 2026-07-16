"""
FOOTBALL LEGACY — Casual Catch Edition
Single-file Pygame game: run with  python game.py
Requires:  pip install pygame
"""

import math, os, json, random, sys

import pygame

pygame.init()

# ── Constants ──
W, H = 800, 600
FPS = 60
SAVE_DIR = os.path.join(os.path.expanduser("~"), ".football_legacy")
os.makedirs(SAVE_DIR, exist_ok=True)
HIGH_FILE = os.path.join(SAVE_DIR, "high_score.json")

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GOLD = (255, 214, 0)
RED = (255, 82, 82)
GREEN = (76, 175, 80)
BLUE = (21, 101, 192)
DARK = (13, 27, 42)
DARK2 = (26, 42, 58)
GRAY = (140, 155, 165)
FIELD = (45, 122, 58)
FIELD2 = (58, 143, 74)
END_RED = (170, 30, 30)
END_GREEN = (30, 80, 40)

font_cache = {}

def F(size, bold=False):
    k = (size, bold)
    if k not in font_cache:
        font_cache[k] = pygame.font.SysFont("arial", size, bold=bold)
    return font_cache[k]

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def pick(lst):
    return lst[random.randint(0, len(lst) - 1)]

def rr(surf, color, rect, r=8, w=0):
    pygame.draw.rect(surf, color, rect, border_radius=r, width=w)

def txt(surf, text, x, y, size=14, color=WHITE, bold=False, cx=False):
    f = F(size, bold)
    s = f.render(str(text), True, color)
    r = s.get_rect()
    if cx:
        r.center = (x, y)
    else:
        r.topleft = (x, y)
    surf.blit(s, r)
    return r

def circ(surf, c, x, y, rad, w=0):
    pygame.draw.circle(surf, c, (int(x), int(y)), int(rad), w)

def lerp_c(a, b, t):
    t = clamp(t, 0, 1)
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


# ── Particles ──
class Particle:
    __slots__ = ("x", "y", "vx", "vy", "life", "decay", "color", "size")

    def __init__(self, x, y, color):
        self.x, self.y = x, y
        self.vx = random.uniform(-4, 4)
        self.vy = random.uniform(-4, 4)
        self.life = 1.0
        self.decay = random.uniform(0.025, 0.05)
        self.color = color
        self.size = random.uniform(2, 5)

particles = []

def spawn(x, y, color, n=12):
    for _ in range(n):
        particles.append(Particle(x, y, color))

def tick_particles():
    for p in particles[:]:
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay
        if p.life <= 0:
            particles.remove(p)

def draw_particles(surf):
    for p in particles:
        a = max(0, min(255, int(p.life * 255)))
        sz = max(1, int(p.size * p.life))
        s = pygame.Surface((sz * 2, sz * 2), pygame.SRCALPHA)
        pygame.draw.circle(s, (*p.color, a), (sz, sz), sz)
        surf.blit(s, (int(p.x) - sz, int(p.y) - sz))


# ── High score ──
def load_high():
    if os.path.exists(HIGH_FILE):
        try:
            with open(HIGH_FILE) as f:
                return json.load(f).get("score", 0)
        except Exception:
            pass
    return 0

def save_high(score):
    if score > load_high():
        with open(HIGH_FILE, "w") as f:
            json.dump({"score": score}, f)


# ── Draw field ──
def draw_field(surf):
    surf.fill(END_GREEN)
    ft, fw, fx = 50, W - 80, 40
    fh = H - 100
    pygame.draw.rect(surf, FIELD2, (fx, ft, fw, fh))
    for i in range(11):
        y = ft + int((i / 10) * fh)
        pygame.draw.line(surf, (255, 255, 255, 140), (fx, y), (fx + fw, y), 1)
        if 0 < i < 10:
            yn = i * 10 if i <= 5 else (10 - i) * 10
            ts = F(18, True).render(str(yn), True, (255, 255, 255, 80))
            surf.blit(ts, ts.get_rect(center=(fx + fw // 2, y + 7)))
    pygame.draw.rect(surf, GOLD, (fx, ft, fw, fh), 3)
    pygame.draw.rect(surf, END_RED, (fx, ft - 2, fw, 40))
    pygame.draw.rect(surf, END_GREEN, (fx, ft + fh - 2, fw, 40))
    return ft, fw, fx, fh


# ── Draw player ──
def draw_player(surf, x, y, body_col, accent_col, number, scale=1.0):
    s = scale
    circ(surf, (235, 210, 170), x, y - int(12 * s), int(5 * s))
    bw, bh = int(7 * s), int(16 * s)
    pygame.draw.rect(surf, body_col, (x - bw, y - int(3 * s), bw * 2, bh), border_radius=3)
    ts = F(max(6, int(8 * s)), True).render(str(number), True, accent_col)
    surf.blit(ts, ts.get_rect(center=(x, y + int(4 * s))))


# ── Football ──
def draw_football(surf, x, y, angle, sz=6):
    x, y = int(x), int(y)
    s = pygame.Surface((sz * 4, int(sz * 2.4)), pygame.SRCALPHA)
    cx, cy = sz * 2, int(sz * 1.2)
    pygame.draw.ellipse(s, (93, 58, 26), (cx - sz, cy - int(sz * 0.6), sz * 2, int(sz * 1.2)))
    pygame.draw.line(s, WHITE, (cx - int(sz * 0.4), cy), (cx + int(sz * 0.4), cy), 1)
    for i in range(-2, 3):
        lx = cx + int(i * sz * 0.18)
        pygame.draw.line(s, WHITE, (lx, cy - int(sz * 0.2)), (lx, cy + int(sz * 0.2)), 1)
    rot = pygame.transform.rotate(s, -math.degrees(angle))
    surf.blit(rot, rot.get_rect(center=(x, y)))

def draw_shadow(surf, x, y, height, sz=6):
    a = clamp(int((0.4 - height * 0.004) * 255), 10, 100)
    sz2 = sz * (1 + height * 0.015)
    s = pygame.Surface((int(sz2 * 4), int(sz2 * 2)), pygame.SRCALPHA)
    pygame.draw.ellipse(s, (0, 0, 0, a), (0, 0, int(sz2 * 4), int(sz2 * 2)))
    surf.blit(s, (int(x - sz2 * 2), int(y + height - sz2)))


# ── Button ──
class Btn:
    def __init__(self, x, y, w, h, label, col=None):
        self.rect = pygame.Rect(x, y, w, h)
        self.label = label
        self.col = col
        self.hover = False

    def draw(self, surf):
        c = BLUE if self.hover else (self.col or DARK2)
        rr(surf, c, self.rect, 8)
        if self.hover:
            rr(surf, GOLD, self.rect, 8, 2)
        sz = 11 if self.rect.height < 40 else 14
        txt(surf, self.label, self.rect.centerx, self.rect.centery, sz, WHITE, True, cx=True)

    def hit(self, mx, my):
        return self.rect.collidepoint(mx, my)


# ── Game ──
class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((W, H))
        pygame.display.set_caption("Football Legacy")
        self.clock = pygame.time.Clock()
        self.running = True
        self.state = "menu"
        self.buttons = []
        self.mx = self.my = 0
        self.menu_t = 0.0

        # casual state
        self.score = 0
        self.misses = 0
        self.high = load_high()
        self.throw_timer = 0.0
        self.throw_interval = 2.5
        self.throw_speed = 4.0
        self.game_over = False
        self.playing = False
        self.receivers = []
        self.qb = {"x": W // 2, "y": 100}
        self.ball = None
        self.combo = None

    def btn(self, x, y, w, h, label, col=None):
        b = Btn(x, y, w, h, label, col)
        self.buttons.append(b)
        return b

    def goto(self, state):
        self.state = state
        self.buttons = []
        cx = W // 2
        if state == "menu":
            self.btn(cx - 130, 320, 260, 50, "Play")
            self.btn(cx - 130, 390, 260, 50, "How to Play")
            self.btn(cx - 130, 460, 260, 50, "Quit")
        elif state == "help":
            self.btn(cx - 130, 510, 260, 50, "Back")
        elif state == "game_over":
            self.btn(cx - 130, 440, 260, 50, "Play Again")
            self.btn(cx - 130, 505, 260, 50, "Menu")

    # ── casual logic ──
    def start_game(self):
        self.score = 0
        self.misses = 0
        self.throw_timer = 1.5
        self.throw_interval = 2.5
        self.throw_speed = 4.0
        self.game_over = False
        self.playing = True
        self.ball = None
        self.combo = None
        particles.clear()
        self.spawn_receivers()

    def spawn_receivers(self):
        self.receivers = []
        cnt = min(7, 3 + self.score // 7)
        sp = (W - 100) / (cnt + 1)
        for i in range(cnt):
            self.receivers.append({
                "x": 50 + sp * (i + 1),
                "y": 400 + random.random() * 100,
                "speed": 4.0 + random.random() * 2,
                "num": random.randint(10, 89),
                "caught": False,
                "anim": 0,
            })

    def do_throw(self):
        if self.ball or self.game_over:
            return
        tgt = pick(self.receivers)
        tx = tgt["x"] + random.uniform(-35, 35)
        ty = tgt["y"] + random.uniform(-25, 25)
        dx, dy = tx - self.qb["x"], ty - self.qb["y"]
        dist = math.hypot(dx, dy)
        dur = max(0.25, dist / (self.throw_speed * 60))
        self.ball = {
            "x": self.qb["x"], "y": self.qb["y"],
            "sx": self.qb["x"], "sy": self.qb["y"],
            "tx": tx, "ty": ty,
            "t": 0.0, "dur": dur,
            "angle": 0.0, "spin": 9 + random.random() * 5,
            "height": 0.0, "max_h": 25 + dist * 0.15,
            "caught": False, "dropped": False,
        }

    def update_casual(self, dt, keys):
        if not self.playing:
            return

        b = self.ball
        if b and not b["caught"] and not b["dropped"]:
            b["t"] += dt / b["dur"]
            p = min(b["t"], 1.0)
            b["x"] = b["sx"] + (b["tx"] - b["sx"]) * p
            b["y"] = b["sy"] + (b["ty"] - b["sy"]) * p
            b["height"] = b["max_h"] * math.sin(p * math.pi)
            b["angle"] += b["spin"] * dt
            for r in self.receivers:
                if r["caught"]:
                    continue
                d = math.hypot(r["x"] - b["x"], r["y"] - b["y"])
                if d < 30 and b["height"] < 20 and p > 0.2:
                    b["caught"] = True
                    r["caught"] = True
                    r["anim"] = 1.0
                    self.score += 1
                    spawn(b["x"], b["y"], GOLD, 16)
                    self.combo = {"t": "CATCH!", "life": 1.2, "x": b["x"], "y": b["y"] - 25, "c": GOLD}
                    if self.score % 5 == 0:
                        self.throw_interval = max(0.7, self.throw_interval - 0.2)
                        self.throw_speed = min(9, self.throw_speed + 0.35)
                    break
            if b["t"] >= 1 and not b["caught"] and not b["dropped"]:
                b["dropped"] = True
                self.misses += 1
                spawn(b["x"], b["y"], RED, 10)
                self.combo = {"t": "MISS", "life": 1.0, "x": b["x"], "y": b["y"] - 25, "c": RED}
                if self.misses >= 10:
                    self.game_over = True
                    self.playing = False
                    save_high(self.score)
                    self.high = load_high()
                    self.goto("game_over")
                    return

        if b and (b["caught"] or b["dropped"]):
            self.ball = None
            self.spawn_receivers()

        if not self.ball:
            self.throw_timer -= dt
            if self.throw_timer <= 0:
                self.do_throw()
                self.throw_timer = self.throw_interval

        mx = (-1 if keys.get(pygame.K_LEFT) or keys.get(pygame.K_a) else 0) + \
             (1 if keys.get(pygame.K_RIGHT) or keys.get(pygame.K_d) else 0)
        my = (-1 if keys.get(pygame.K_UP) or keys.get(pygame.K_w) else 0) + \
             (1 if keys.get(pygame.K_DOWN) or keys.get(pygame.K_s) else 0)
        for r in self.receivers:
            if r["caught"]:
                r["anim"] -= dt * 3
                if r["anim"] <= 0:
                    r["caught"] = False
                continue
            r["x"] = clamp(r["x"] + mx * r["speed"], 55, W - 55)
            r["y"] = clamp(r["y"] + my * r["speed"], 260, H - 55)

        if self.combo:
            self.combo["life"] -= dt
            self.combo["y"] -= 28 * dt
            if self.combo["life"] <= 0:
                self.combo = None

    def draw_casual(self):
        draw_field(self.screen)
        draw_player(self.screen, self.qb["x"], self.qb["y"], (198, 40, 40), (183, 28, 28), 7, 1.3)
        for r in self.receivers:
            draw_player(self.screen, r["x"], r["y"], (21, 101, 192), (13, 71, 161), r["num"], 1.1)
        if self.ball:
            draw_shadow(self.screen, self.ball["x"], self.ball["y"], self.ball["height"], 7)
            draw_football(self.screen, self.ball["x"], self.ball["y"] - self.ball["height"],
                          self.ball["angle"], 7)
        draw_particles(self.screen)
        rr(self.screen, (0, 0, 0, 200), (10, 8, 280, 38), 8)
        txt(self.screen, f"Score: {self.score}", 20, 16, 16, WHITE, True)
        mc = RED if self.misses >= 7 else GOLD
        txt(self.screen, f"Misses: {self.misses} / 10", 150, 16, 16, mc, True)
        txt(self.screen, f"Best: {self.high}", W - 20, 16, 16, (144, 202, 249), True)
        sp_pct = clamp((self.throw_speed - 4) / 5, 0, 1)
        bar_w = 120
        bx = W - bar_w - 20
        pygame.draw.rect(self.screen, DARK2, (bx, 30, bar_w, 6), border_radius=3)
        pygame.draw.rect(self.screen, GOLD, (bx, 30, int(bar_w * sp_pct), 6), border_radius=3)
        txt(self.screen, "Speed", bx - 35, 24, 9, GRAY)
        if self.combo:
            c = self.combo
            a = max(0, min(255, int(c["life"] / 1.2 * 255)))
            s2 = F(24, True).render(c["t"], True, c["c"])
            s2.set_alpha(a)
            self.screen.blit(s2, s2.get_rect(center=(int(c["x"]), int(c["y"]))))

    def draw_menu(self):
        self.menu_t += 0.025
        for y in range(H):
            t = y / H
            c = lerp_c((8, 18, 32), (6, 70, 80), t)
            pygame.draw.line(self.screen, c, (0, y), (W, y))
        for i in range(6):
            yy = 100 + i * 35
            a = int((0.06 + math.sin(self.menu_t + i * 0.6) * 0.03) * 255)
            pygame.draw.line(self.screen, (255, 214, 0, a), (0, yy), (W, yy), 1)
        sc = 1 + math.sin(self.menu_t * 2) * 0.025
        t1 = F(52, True).render("FOOTBALL", True, GOLD)
        t1 = pygame.transform.smoothscale(t1, (int(t1.get_width() * sc), int(t1.get_height() * sc)))
        self.screen.blit(t1, t1.get_rect(center=(W // 2, 120)))
        t2 = F(56, True).render("LEGACY", True, WHITE)
        t2 = pygame.transform.smoothscale(t2, (int(t2.get_width() * sc), int(t2.get_height() * sc)))
        self.screen.blit(t2, t2.get_rect(center=(W // 2, 160)))
        txt(self.screen, "🏈", W // 2, 210, 28, WHITE, cx=True)
        rr(self.screen, FIELD, (60, 235, W - 120, 50), 6)
        pygame.draw.line(self.screen, (255, 255, 255, 80), (W // 4, 240), (W // 4, 280), 1)
        pygame.draw.line(self.screen, (255, 255, 255, 80), (W // 2, 240), (W // 2, 280), 1)
        pygame.draw.line(self.screen, (255, 255, 255, 80), (W * 3 // 4, 240), (W * 3 // 4, 280), 1)
        if self.high > 0:
            txt(self.screen, f"High Score: {self.high}", W // 2, 300, 14, GRAY, cx=True)

    def draw_help(self):
        self.screen.fill(DARK)
        txt(self.screen, "HOW TO PLAY", W // 2, 60, 32, GOLD, True, cx=True)
        lines = [
            ("Arrow Keys / WASD", "Move your receivers"),
            ("Catch the ball", "+1 point"),
            ("Miss the ball", "+1 miss"),
            ("10 misses", "Game over"),
            ("Every 5 catches", "Ball speeds up"),
            ("", ""),
            ("The QB throws automatically.", ""),
            ("Get to the landing spot before", ""),
            ("the ball arrives!", ""),
        ]
        y = 120
        for left, right in lines:
            if left:
                txt(self.screen, left, 160, y, 15, WHITE, True)
                txt(self.screen, right, 440, y, 15, GRAY)
            y += 32

    def draw_game_over(self):
        draw_field(self.screen)
        dim = pygame.Surface((W, H), pygame.SRCALPHA)
        dim.fill((0, 0, 0, 190))
        self.screen.blit(dim, (0, 0))
        txt(self.screen, "GAME OVER", W // 2, 130, 48, RED, True, cx=True)
        rr(self.screen, DARK2, (W // 2 - 150, 190, 300, 140), 12)
        rr(self.screen, GOLD, (W // 2 - 150, 190, 300, 140), 12, 2)
        txt(self.screen, "FINAL SCORE", W // 2, 215, 14, GRAY, cx=True)
        txt(self.screen, str(self.score), W // 2, 255, 48, GOLD, True, cx=True)
        new_best = self.score >= self.high and self.score > 0
        if new_best:
            txt(self.screen, "NEW HIGH SCORE!", W // 2, 295, 16, GREEN, True, cx=True)
        else:
            txt(self.screen, f"Best: {self.high}", W // 2, 295, 16, GRAY, cx=True)
        rr(self.screen, (20, 30, 45), (W // 2 - 120, 350, 240, 50), 8)
        txt(self.screen, f"Catches: {self.score}   Misses: {self.misses}", W // 2, 375, 14, WHITE, cx=True)

    def on_click(self, mx, my):
        if self.state == "casual":
            return
        for b in self.buttons:
            if b.hit(mx, my):
                self.handle_btn(b.label)
                return

    def handle_btn(self, label):
        cx = W // 2
        if label == "Play":
            self.start_game()
            self.goto("casual")
        elif label == "How to Play":
            self.goto("help")
        elif label == "Quit":
            self.running = False
        elif label == "Back":
            self.goto("menu")
        elif label == "Play Again":
            self.start_game()
            self.goto("casual")
        elif label == "Menu":
            self.goto("menu")

    def run(self):
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0

            for ev in pygame.event.get():
                if ev.type == pygame.QUIT:
                    self.running = False
                elif ev.type == pygame.MOUSEMOTION:
                    self.mx, self.my = ev.pos
                    for b in self.buttons:
                        b.hover = b.hit(self.mx, self.my)
                elif ev.type == pygame.MOUSEBUTTONDOWN and ev.button == 1:
                    self.mx, self.my = ev.pos
                    self.on_click(self.mx, self.my)
                elif ev.type == pygame.KEYDOWN:
                    if self.state == "menu":
                        if ev.key in (pygame.K_SPACE, pygame.K_RETURN):
                            self.start_game()
                            self.goto("casual")
                    elif self.state == "game_over":
                        if ev.key in (pygame.K_SPACE, pygame.K_RETURN):
                            self.start_game()
                            self.goto("casual")

            if self.state == "casual":
                keys = pygame.key.get_pressed()
                kd = {
                    pygame.K_LEFT: keys[pygame.K_LEFT], pygame.K_RIGHT: keys[pygame.K_RIGHT],
                    pygame.K_UP: keys[pygame.K_UP], pygame.K_DOWN: keys[pygame.K_DOWN],
                    pygame.K_a: keys[pygame.K_a], pygame.K_d: keys[pygame.K_d],
                    pygame.K_w: keys[pygame.K_w], pygame.K_s: keys[pygame.K_s],
                }
                self.update_casual(dt, kd)
            tick_particles()

            self.screen.fill(DARK)
            if self.state == "menu":
                self.draw_menu()
            elif self.state == "help":
                self.draw_help()
            elif self.state == "casual":
                self.draw_casual()
            elif self.state == "game_over":
                self.draw_game_over()

            for b in self.buttons:
                b.draw(self.screen)

            pygame.display.flip()

        pygame.quit()


if __name__ == "__main__":
    Game().run()
