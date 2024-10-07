#[cfg(feature = "native")]
use libloading::{Library, Symbol};
use raylib_wasm::{*, KeyboardKey as Key};

use game::*;

#[cfg(feature = "native")]
const GAME_PATH: &str = if cfg!(target_os = "linux") {
    "./target/debug/libgame.so"
} else if cfg!(target_os = "windows") {
    ".\\target\\debug\\libgame.dll"
} else {
    "./target/debug/libgame.dylib"
};

#[cfg(feature = "native")]
#[inline]
unsafe fn load_lib(file_path: &str) -> Library {
    Library::new(file_path).expect("failed to load the library")
}

#[cfg(feature = "native")]
#[inline]
unsafe fn load_fn<'lib, T>(lib: &'lib Library, symbol: &str) -> Symbol::<'lib, T> {
    lib.get(symbol.as_bytes()).map_err(|err| {
        eprintln!("{err}"); err
    }).unwrap()
}

unsafe fn start() {
    #[cfg(feature = "native")]
    let mut lib = load_lib(GAME_PATH);
    #[cfg(feature = "native")]
    let mut game_frame = load_fn::<Symbol::<GameFrame>>(&lib, "game_frame");

	let mut state = game_init();
    while !WindowShouldClose() {
        #[cfg(feature = "native")]
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
