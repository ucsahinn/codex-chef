# Windows Notes

Official reference:

https://developers.openai.com/codex/windows

## Recommended Posture

- Prefer native Windows sandboxing when working in Windows repositories.
- Use the elevated sandbox when administrator-approved setup is available.
- Use WSL2 when your toolchain is Linux-native or native Windows sandbox setup
  is blocked by policy.
- Keep repositories under the native filesystem for the environment you are
  using. For WSL, keep repos under the Linux home directory for better I/O.

## Starter Defaults

The Windows template sets:

```toml
[windows]
sandbox = "elevated"
sandbox_private_desktop = true
```

If your machine cannot use elevated sandboxing, change to:

```toml
[windows]
sandbox = "unelevated"
```

Do not switch to unrestricted access as a routine workaround. Fix the sandbox
or use a narrower profile instead.

## Useful Checks

```powershell
codex doctor --summary
codex exec --strict-config "Summarize the active setup."
```

For additional temporary read access inside a session:

```text
/sandbox-add-read-dir C:\absolute\directory\path
```
