fn main() {
    #[cfg(feature = "native")]
    {
        println!("cargo:rustc-link-lib=static=raylib");
        println!("cargo:rustc-link-search=./lib");
    }
}
