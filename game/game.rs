use raylib_light::{*, KeyboardKey as KEY};

const WINDOW_WIDTH: i32 = 800;
const WINDOW_HEIGHT: i32 = 600;

const SPEED_DEFAULT: f32 = 850.0;
const SPEED_BOOSTED: f32 = 1550.0;

pub struct State {
    rect: Rectangle,
    speed: f32
}

#[no_mangle]
pub unsafe fn game_init() -> State {
    SetTargetFPS(144);
    InitWindow(WINDOW_WIDTH, WINDOW_HEIGHT, cstr!("Game"));

    State {
        rect: Rectangle {
            x: (WINDOW_WIDTH as f32 - 100.0)/2.0,
            y: (WINDOW_HEIGHT as f32 - 100.0)/2.0,
            width: 100.0,
            height: 100.0
        },
        speed: 850.0
    }
}

unsafe fn handle_keys(state: &mut State) {
    let dt = GetFrameTime();
    if IsKeyDown(KEY::Space) { state.speed = SPEED_BOOSTED; }
    if !IsKeyDown(KEY::Space) { state.speed = SPEED_DEFAULT; }
    if IsKeyDown(KEY::W) { state.rect.y -= dt*state.speed; }
    if IsKeyDown(KEY::A) { state.rect.x -= dt*state.speed; }
    if IsKeyDown(KEY::S) { state.rect.y += dt*state.speed; }
    if IsKeyDown(KEY::D) { state.rect.x += dt*state.speed; }
}

pub type GameFrame = unsafe fn(state: &mut State);

#[no_mangle]
pub unsafe fn game_frame(state: &mut State) {
    handle_keys(state);
    BeginDrawing();
        ClearBackground(DARKGREEN);
        DrawText(cstr!("hello world"), 250, 500, 50, RAYWHITE);
        DrawRectangleRec(state.rect, RAYWHITE);
    EndDrawing();
}

#[no_mangle]
pub unsafe fn game_over() {
    CloseWindow();
}
