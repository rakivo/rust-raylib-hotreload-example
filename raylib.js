'use strict';

const WASM_PATH = "./target/wasm32-unknown-unknown/debug/hotreload-raylib-wasm-template.wasm"
const FONT_SCALE_MAGIC = 0.65;
const GLFW_MAP = {
    "Space":          32,
    "Quote":          39,
    "Comma":          44,
    "Minus":          45,
    "Period":         46,
    "Slash":          47,
    "Digit0":         48,
    "Digit1":         49,
    "Digit2":         50,
    "Digit3":         51,
    "Digit4":         52,
    "Digit5":         53,
    "Digit6":         54,
    "Digit7":         55,
    "Digit8":         56,
    "Digit9":         57,
    "Semicolon":      59,
    "Equal":          61,
    "KeyA":           65,
    "KeyB":           66,
    "KeyC":           67,
    "KeyD":           68,
    "KeyE":           69,
    "KeyF":           70,
    "KeyG":           71,
    "KeyH":           72,
    "KeyI":           73,
    "KeyJ":           74,
    "KeyK":           75,
    "KeyL":           76,
    "KeyM":           77,
    "KeyN":           78,
    "KeyO":           79,
    "KeyP":           80,
    "KeyQ":           81,
    "KeyR":           82,
    "KeyS":           83,
    "KeyT":           84,
    "KeyU":           85,
    "KeyV":           86,
    "KeyW":           87,
    "KeyX":           88,
    "KeyY":           89,
    "KeyZ":           90,
    "BracketLeft":    91,
    "Backslash":      92,
    "BracketRight":   93,
    "Backquote":      96,
    "Escape":         256,
    "Enter":          257,
    "Tab":            258,
    "Backspace":      259,
    "Insert":         260,
    "Delete":         261,
    "ArrowRight":     262,
    "ArrowLeft":      263,
    "ArrowDown":      264,
    "ArrowUp":        265,
    "PageUp":         266,
    "PageDown":       267,
    "Home":           268,
    "End":            269,
    "CapsLock":       280,
    "ScrollLock":     281,
    "NumLock":        282,
    "PrintScreen":    283,
    "Pause":          284,
    "F1":             290,
    "F2":             291,
    "F3":             292,
    "F4":             293,
    "F5":             294,
    "F6":             295,
    "F7":             296,
    "F8":             297,
    "F9":             298,
    "F10":            299,
    "F11":            300,
    "F12":            301,
    "F13":            302,
    "F14":            303,
    "F15":            304,
    "F16":            305,
    "F17":            306,
    "F18":            307,
    "F19":            308,
    "F20":            309,
    "F21":            310,
    "F22":            311,
    "F23":            312,
    "F24":            313,
    "F25":            314,
    "NumPad0":        320,
    "NumPad1":        321,
    "NumPad2":        322,
    "NumPad3":        323,
    "NumPad4":        324,
    "NumPad5":        325,
    "NumPad6":        326,
    "NumPad7":        327,
    "NumPad8":        328,
    "NumPad9":        329,
    "NumpadDecimal":  330,
    "NumpadDivide":   331,
    "NumpadMultiply": 332,
    "NumpadSubtract": 333,
    "NumpadAdd":      334,
    "NumpadEnter":    335,
    "NumpadEqual":    336,
    "ShiftLeft":      340,
    "ControlLeft" :   341,
    "AltLeft":        342,
    "MetaLeft":       343,
    "ShiftRight":     344,
    "ControlRight":   345,
    "AltRight":       346,
    "MetaRight":      347,
    "ContextMenu":    348,
}

function cstrlen(mem, ptr) {
    let len = 0;
    while (mem[ptr] != 0) {
        len++;
        ptr++;
    }
    return len;
}

function cstr_by_ptr(mem_buffer, ptr) {
    const mem = new Uint8Array(mem_buffer);
    const len = cstrlen(mem, ptr);
    const bytes = new Uint8Array(mem_buffer, ptr, len);
    return new TextDecoder().decode(bytes);
}

function color_hex_unpacked(r, g, b, a) {
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');
    a = a.toString(16).padStart(2, '0');
    return "#"+r+g+b+a;
}

function getColorFromMemory(buffer, color_ptr) {
    const [r, g, b, a] = new Uint8Array(buffer, color_ptr, 4);
    return color_hex_unpacked(r, g, b, a);
}

function make_environment(...envs) {
    return new Proxy(envs, {
        get(target, prop, receiver) {
            for (let env of envs) if (env.hasOwnProperty(prop)) return env[prop];
            return (...args) => {console.error("NOT IMPLEMENTED: "+prop, args)}
        }
    });
}

let prev_pressed_key = new Set();
let curr_pressed_key = new Set();

const keyDown = (e) => {
    e.preventDefault();
    curr_pressed_key.add(GLFW_MAP[e.code]);
}

const keyUp = (e) => {
    e.preventDefault();
    curr_pressed_key.delete(GLFW_MAP[e.code]);
}

const game = document.getElementById("game");
var container = game.parentElement; // parent div
const ctx = game.getContext("2d");

game.onmousemove = handleMouseMove;

function handleMouseMove(event) {
    var rect = container.getBoundingClientRect();
    var xf = event.offsetX / rect.width;
    var yf = event.offsetY / rect.height;
    game.mouseX = xf * game.width;
    game.mouseY = yf * game.height;
}

var SCALE_TO_FIT = true;
var WIDTH = 800;
var HEIGHT = 600;

function onResize() {
    var w;
    var h;

    if (SCALE_TO_FIT) {
        w = window.innerWidth;
        h = window.innerHeight;

        var r = HEIGHT / WIDTH;

        if (w * r > window.innerHeight) {
            w = Math.min(w, Math.ceil(h / r));
        }
        h = Math.floor(w * r);
    } else {
        w = WIDTH;
        h = HEIGHT;
    }

    container.style.width = game.style.width = w + "px";
    container.style.height = game.style.height = h + "px";
    container.style.top = Math.floor((window.innerHeight - h) / 2) + "px";
    container.style.left = Math.floor((window.innerWidth - w) / 2) + "px";
}
window.addEventListener('resize', onResize);

onResize();

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    // Mobile device style: fill the whole browser client area with the game canvas:
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    document.getElementsByTagName('head')[0].appendChild(meta);
}


let images = []

let wasm = undefined;
let dt = undefined;
let wf = undefined;
let quit = undefined;
let prev = undefined;
let targetFPS = undefined;

const GetFPS = () => 1.0 / dt;

WebAssembly.instantiateStreaming(fetch(WASM_PATH), {
    "env": make_environment({
        GetMousePositionX_: () => game.mouseX,
        GetMousePositionY_: () => game.mouseY,
        InitWindow: (w, h, t) => {
            game.width = w;
            game.height = h;
            const buffer = wf.memory.buffer;
            document.title = cstr_by_ptr(buffer, t);
        },
        BeginDrawing: () => {},
        SetExitKey: () => {},
        CloseWindow: () => {},
        EndDrawing: () => {
            prev_pressed_key.clear();
            prev_pressed_key = new Set(curr_pressed_key);
        },
        IsKeyReleased: (key) => prev_pressed_key.has(key) && !curr_pressed_key.has(key),
        IsKeyDown: (key) => curr_pressed_key.has(key),
        ClearBackground_: (color_ptr) => {
            const buffer = wf.memory.buffer;
            const color = getColorFromMemory(buffer, color_ptr);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },
        MeasureText: (text_ptr, fontSize) => {
            const buffer = wasm.instance.exports.memory.buffer;
            const text = cstr_by_ptr(buffer, text_ptr);
            fontSize *= FONT_SCALE_MAGIC;
            ctx.font = `${fontSize}px grixel`;
            return ctx.measureText(text).width;
        },
        DrawText_: (text_ptr, posX, posY, fontSize, color_ptr) => {
            const buffer = wf.memory.buffer;
            const text = cstr_by_ptr(buffer, text_ptr);
            const color = getColorFromMemory(buffer, color_ptr);
            fontSize *= FONT_SCALE_MAGIC;
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px grixel`;
            const lines = text.split('\n');
            for (var i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], posX, posY + fontSize + (i * fontSize));
            }
        },
        DrawLine_: (startPosX, startPosY, endPosX, endPosY, color_ptr) => {
            const buffer = wf.memory.buffer;
            const color = getColorFromMemory(buffer, color_ptr);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(startPosX, startPosY);
            ctx.lineTo(endPosX, endPosY);
            ctx.strokeStyle = color;
            ctx.stroke();
        },
        DrawRectangle_: (posX, posY, width, height, color_ptr) => {
            const buffer = wf.memory.buffer;
            const color = getColorFromMemory(buffer, color_ptr);
            ctx.fillStyle = color;
            ctx.fillRect(posX, posY, width, height);
        },
        DrawRectangleV_: (position_ptr, size_ptr, color_ptr) => {
            const buffer = wf.memory.buffer;
            const [x, y] = new Float32Array(buffer, position_ptr, 2);
            const [width, height] = new Float32Array(buffer, size_ptr, 2);
            const color = getColorFromMemory(buffer, color_ptr);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        },
        DrawRectangleRec_: (rec_ptr, color_ptr) => {
            const buffer = wf.memory.buffer;
            const [x, y, w, h] = new Float32Array(buffer, rec_ptr, 4);
            const color = getColorFromMemory(buffer, color_ptr);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        },
        // DrawTexture: (id, x, y, color_ptr) => {
        //     console.log(x, y, id);
        //     const img = images[id];
        //     ctx.drawImage(img, 0, y);
        // },
        LoadTexture: (result_ptr, file_path_ptr) => {
            const buffer = wf.memory.buffer;
            const file_path = cstr_by_ptr(buffer, file_path_ptr);

            let result = new Uint32Array(buffer, result_ptr, 5)
            let img = new Image();
            img.src = file_path;
            images.push(img);

            img.onload = () => {
                images.push(img);
                result[0] = images.indexOf(img);
                result[1] = img.width; // width
                result[2] = img.height; // height
                result[3] = 1; // mipmaps
                result[4] = 7; // format PIXELFORMAT_UNCOMPRESSED_R8G8B8A8
            };

            return result;
        },
        UnloadTexture: () => {},
        GetScreenWidth: () => ctx.canvas.width,
        GetScreenHeight: () => ctx.canvas.height,
        GetFrameTime: () => Math.min(dt, 1.0 / targetFPS),
        IsWindowResized: () => false,
        WindowShouldClose: () => false,
        SetTargetFPS: (x) => targetFPS = x,
        GetFPS: () => GetFPS(),
        DrawFPS: (x, y) => {
            const fontSize = 50.0 * FONT_SCALE_MAGIC;
            const fps = GetFPS();
            let color = "lime";                               // Good FPS
            if ((fps < 30) && (fps >= 15)) color = "orange";  // Warning FPS
            else if (fps < 15) color = "red";                 // Low FPS
            ctx.fillStyle = "green";
            ctx.font = `${fontSize}px grixel`;
            ctx.fillText(targetFPS, x, y + fontSize);
        },
        alert: (ptr) => {
            let msg = cstr_by_ptr(ptr);
            console.log(msg);
            window.alert(msg);
        }
    })
}).then(w => {
    wasm = w;
    wf = w.instance.exports;
    console.log(w);

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    let state = wf.game_init();
    const next = (timestamp) => {
        if (quit) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            window.removeEventListener("keydown", keyDown);
            return;
        }
        dt = (timestamp - prev)/1000.0;
        prev = timestamp;
        wf.game_frame(state);
        window.requestAnimationFrame(next);
    };
    window.requestAnimationFrame((timestamp) => {
        prev = timestamp;
        window.requestAnimationFrame(next);
    });
}).catch((err) => {
    console.log(err);
    console.log('update WASM_PATH in `main.js` bruv!');
});
