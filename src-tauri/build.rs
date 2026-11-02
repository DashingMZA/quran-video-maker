fn main() {
    // ---- Display version (About page mein dikhane ke liye) --------------
    // CI (GitHub Actions release workflow, jahan GITHUB_REF_NAME set hota
    // hai) mein Cargo package version use hoti hai (jo release workflow git
    // tag se pehle hi patch kar chuki hoti hai). Local dev builds mein
    // short git commit hash dikhta hai, ya "Development" agar git na mile.
    let version = if std::env::var("GITHUB_REF_NAME").is_ok() {
        format!("v{}", env!("CARGO_PKG_VERSION"))
    } else {
        let hash = std::process::Command::new("git")
            .args(["rev-parse", "--short", "HEAD"])
            .output()
            .ok()
            .filter(|o| o.status.success())
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string())
            .unwrap_or_default();

        if hash.is_empty() {
            "Development".to_string()
        } else {
            format!("dev-{hash}")
        }
    };
    println!("cargo:rustc-env=APP_VERSION={version}");
    println!("cargo:rerun-if-changed=.git/HEAD");
    println!("cargo:rerun-if-changed=.git/refs/heads");

    // ---- Windows: custom app manifest ------------------------------------
    // `windows-app-manifest.xml` (Common Controls v6 dependency — zaroori
    // hai taake tauri ke native dialogs/tray sahi theme ke sath dikhein,
    // warna kuch systems pe Windows-95-style dialogs aate hain) ko official
    // `tauri_build` API (`WindowsAttributes::app_manifest`) ke through embed
    // karte hain. Ye file yahan rakhna hai taake future mein zaroorat pare
    // to DPI-awareness ya requestedExecutionLevel jaisi cheezein bhi isi
    // manifest mein add ki ja sakein.
    //
    // Note: `include_str!` compile-time macro hai, isliye ye file Windows ke
    // ilawa baaki platforms pe bhi (source mein) maujood honi chahiye — us
    // waqt bas istemal nahi hoti (dead code, koi asar nahi).
    let mut attributes = tauri_build::Attributes::new();
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        attributes = attributes.windows_attributes(
            tauri_build::WindowsAttributes::new()
                .app_manifest(include_str!("windows-app-manifest.xml")),
        );
    }

    tauri_build::try_build(attributes).expect("failed to build Tauri resources");
}
