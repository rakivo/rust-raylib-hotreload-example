use libloading::{Library, Symbol};
use raylib_light::{*, KeyboardKey as Key};

use game::*;

const GAME_PATH: &str = if cfg!(target_os = "linux") {
    "./target/debug/libgame.so"
} else if cfg!(target_os = "windows") {
    ".\\target\\debug\\libgame.dll"
} else {
    "./target/debug/libgame.dylib"
};

#[inline]
unsafe fn load_lib(file_path: &str) -> Library {
    Library::new(file_path).expect("failed to load the library")
}

#[inline]
unsafe fn load_fn<'lib, T>(lib: &'lib Library, symbol: &str) -> Symbol::<'lib, T> {
    lib.get(symbol.as_bytes()).map_err(|err| {
        eprintln!("{err}"); err
    }).unwrap()
}

unsafe fn start() {
    let mut lib = load_lib(GAME_PATH);
    let mut game_frame = load_fn::<Symbol::<GameFrame>>(&lib, "game_frame");

	let mut state = game_init();
    while !WindowShouldClose() {
        if IsKeyPressed(Key::R) {
            drop(game_frame);
            drop(lib);
            lib = load_lib(GAME_PATH);
            game_frame = load_fn(&lib, "game_frame");
        }
		game_frame(&mut state);
	}
}

fn main() {
	unsafe { start() }
}
