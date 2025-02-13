use raylib_wasm::{*, KeyboardKey as KEY};

#[cfg(feature = "web")]
extern {
    pub fn GetMousePositionX_() -> f32;
    pub fn GetMousePositionY_() -> f32;
}

#[cfg(feature = "web")]
#[allow(non_snake_case)]
unsafe fn GetMousePosition() -> Vector2 {
    Vector2 { x: GetMousePositionX_(), y: GetMousePositionY_() }
}
const WINDOW_WIDTH: i32 = 800;
const WINDOW_HEIGHT: i32 = 600;

const SPEED_DEFAULT: f32 = 850.0;
const SPEED_BOOSTED: f32 = 1550.0;

pub struct State {
    rect: Rectangle,
    speed: f32,
    mouse_pos: Vector2
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
        speed: 850.0,
        mouse_pos: Vector2 { x: 0.0, y: 0.0 }
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

unsafe fn handle_mouse(state: &mut State) {
    state.mouse_pos = GetMousePosition();    
}

pub type GameFrame = unsafe fn(state: &mut State);

#[no_mangle]
pub unsafe fn game_frame(state: &mut State) {
    handle_keys(state);
    handle_mouse(state);

    BeginDrawing();
        ClearBackground(DARKGREEN);
        DrawText(cstr!("hello world"), 250, 500, 50, RAYWHITE);
        DrawRectangleRec(state.rect, RAYWHITE);
        DrawRectangleV(state.mouse_pos, Vector2 { x: 10.0, y: 10.0 }, RAYWHITE);
    EndDrawing();
}

#[no_mangle]
pub unsafe fn game_over() {
    CloseWindow();
}
