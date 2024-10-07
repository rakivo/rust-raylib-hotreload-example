fn main() {
    #[cfg(feature = "native")]
    {
        println!("cargo::rustc-link-arg=-lraylib");
    }

    #[cfg(feature = "web")]
    {
        println!("cargo::rustc-link-arg=-lraylib");
        println!("cargo::rustc-link-arg=-L./lib");
    }
}
