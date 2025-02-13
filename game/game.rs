use raylib_wasm::{*, KeyboardKey as KEY};

#[cfg(feature = "web")]
extern {
    pub fn GetMousePositionX_() -> f32;
    pub fn GetMousePositionY_() -> f32;
    pub fn DrawCircle_(_: i32, _: i32, _: f32, _: *const Color);
}

#[cfg(feature = "web")]
#[allow(non_snake_case)]
unsafe fn GetMousePosition() -> Vector2 {
    Vector2 { x: GetMousePositionX_(), y: GetMousePositionY_() }
}

#[cfg(feature = "web")]
use std::ptr::addr_of;

#[cfg(feature = "web")]
#[allow(non_snake_case)]
unsafe fn DrawCircle(x: i32, y: i32, radius: f32, color: Color) {
    DrawCircle_(x, y, radius, addr_of!(color));
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
        DrawFPS(WINDOW_WIDTH - 100, 10);
        let text = format!("rect: [{}, {}]", state.rect.x.round(), state.rect.y.round());
        DrawText(cstr!(text), 10, 10, 20, RAYWHITE);
        let text = format!("mouse: [{}, {}]", state.mouse_pos.x.round(), state.mouse_pos.y.round());
        DrawText(cstr!(text), 10, 30, 20, RAYWHITE);
        DrawCircle(state.mouse_pos.x as i32, state.mouse_pos.y as i32, 10.0, RAYWHITE);
    EndDrawing();
}

#[no_mangle]
pub unsafe fn game_over() {
    CloseWindow();
}
