#!/usr/bin/env bash
# Installs terminal/CLI tools LazyVim plugins expect: fzf, fd, ripgrep, bat, tmux, lazygit.
set -euo pipefail

apt-get update -y >/dev/null
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  fzf fd-find bat ripgrep tmux >/dev/null

# Debian ships fd as `fdfind` and bat as `batcat` — provide the expected names.
[ -e /usr/bin/fdfind ] && ln -sf /usr/bin/fdfind /usr/local/bin/fd
[ -e /usr/bin/batcat ] && ln -sf /usr/bin/batcat /usr/local/bin/bat

# lazygit (not in Debian repos) — static binary from the latest release.
# Resolve the version tag via the /releases/latest redirect, avoiding GitHub API rate limits.
if ! command -v lazygit >/dev/null 2>&1; then
  tag="$(curl -fsSI https://github.com/jesseduffield/lazygit/releases/latest \
    | grep -i '^location:' | tr -d '\r' | sed -E 's#.*/tag/(v[0-9][^ /]*) *$#\1#')"
  if [[ -n "$tag" ]]; then
    curl -fsSL "https://github.com/jesseduffield/lazygit/releases/download/$tag/lazygit_${tag#v}_Linux_x86_64.tar.gz" \
      | tar -xz -C /tmp lazygit
    install -m755 /tmp/lazygit /usr/local/bin/lazygit
  else
    echo "lazygit download skipped (could not resolve latest tag)"
  fi
fi

echo "Installed: fzf fd rg bat tmux lazygit"