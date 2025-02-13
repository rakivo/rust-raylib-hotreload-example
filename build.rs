fn main() {
    #[cfg(feature = "native")]
    {
        println!("cargo:rustc-link-lib=raylib");
    }
}
