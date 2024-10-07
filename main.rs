use libloading::{Library, Symbol};
use raylib_light::{*, KeyboardKey as Key};

use plug::*;

const PLUG_PATH: &str = if cfg!(target_os = "linux") {
    "./target/debug/libplug.so"
} else if cfg!(target_os = "windows") {
    ".\\target\\debug\\libplug.dll"
} else {
    "./target/debug/libplug.dylib"
};

unsafe fn main_() {
    let mut lib = unsafe { Library::new(PLUG_PATH).expect("failed to load the library") };
    let mut game_frame: Symbol::<GameFrame> = unsafe {
        lib.get(b"game_frame").expect("could not find `game_frame` function")
    };

	let mut state = game_init();
    while !WindowShouldClose() {
        if IsKeyPressed(Key::R) {
            drop(game_frame);
            drop(lib);
            lib = unsafe { Library::new(PLUG_PATH).expect("failed to load the library") };
            game_frame = unsafe {
                lib.get(b"game_frame").expect("could not find `game_frame` function")
            };
        }
		game_frame(&mut state);
	}
}

fn main() {
	unsafe { main_() }
}
