---
id: index
title: NVIDIA Brev
description: How to register a Linux machine (for example, a UDESC VDI with an NVIDIA GPU) with Brev Connect and give people SSH access through brev shell.
slug: /guides/nvidia-brev
---

How to register a Linux machine with [Brev Connect](https://docs.nvidia.com/brev/latest/concepts/brev-connect) and give people SSH access through `brev shell`.

**NVIDIA docs:** [Brev Connect CLI](https://docs.nvidia.com/brev/latest/cli/brev-connect) · [Managing Brev Connect](https://docs.nvidia.com/brev/latest/guides/registered-compute/managing-brev-connect) · [Connect DGX Spark](https://docs.nvidia.com/brev/latest/guides/registered-compute/connect-dgx-spark) (same flow on any Linux machine) · [CLI reference](https://docs.nvidia.com/brev/latest/cli/cli-overview) · [Troubleshooting](https://docs.nvidia.com/brev/latest/troubleshooting/troubleshooting-overview)

## Before you start

- A Brev account that is Owner of the organization.
- `sudo` on the machine.

## 1. Brev CLI and login

```bash
curl -fsSL https://raw.githubusercontent.com/brevdev/brev-cli/main/bin/install-latest.sh | bash
export PATH="$HOME/.local/bin:$PATH"
unset BREV_API_KEY          # overrides your login; clear it in every new terminal
brev login                  # log in as the org Owner
brev org ls                 # confirm the right org is active (*)
```

:::warning
If `BREV_API_KEY` is set anywhere (such as `~/.bashrc`), remove it. While it's set, the CLI uses that key instead of your login, and `grant-ssh` fails with `permission_denied`.
:::

## 2. Install NetBird first (apt package, not snap)

Brev Connect's tunnel is NetBird. Install it before registering:

```bash
curl -fsSL https://pkgs.netbird.io/install.sh | sh     # ignore a "netbird-ui" dependency error (desktop app only)
sudo systemctl enable --now netbird
sudo netbird status                                     # "NeedsLogin" is expected here
```

:::danger
Don't use `snap install netbird`. The snap listens on a different socket, so Brev can't control it.
:::

## 3. Domain accounts only: NetBird wrapper

During registration, Brev runs `sudo netbird up …`. NetBird 0.82 refuses to run when it can't look up the account that called sudo (`refusing to fall back to root`), and Brev reports only `setup command failed: exit status 1`. This wrapper fixes it:

```bash
sudo tee /usr/local/sbin/netbird >/dev/null <<'EOF'
#!/bin/sh
exec env -u SUDO_USER -u SUDO_UID -u SUDO_GID /usr/bin/netbird "$@"
EOF
sudo chmod 755 /usr/local/sbin/netbird
hash -r
```

Leave it installed for as long as the machine is registered.

## 4. Register the machine

```bash
brev register --name <node-name> --org <org-name>
brev ls nodes               # must say Connected
```

If registration prints `setup command failed`, the node won't connect. Exit status 127 means NetBird isn't installed (step 2). Exit status 1 is almost always the domain-account problem (step 3).

## 5. Turn on SSH

```bash
brev enable-ssh --ssh-port 22
brev ports ls <node-name>   # note the nport-... ID
```

This adds Brev's certificate-authority (CA) line to **your own** `~/.ssh/authorized_keys`:

```
cert-authority,principals="brev:v1:vm:<node-id>:login:<linux-user>" ssh-rsa AAAA...
```

Step 6 copies it to the accounts people will actually log in with.

## 6. Create a local account for each person

Brev doesn't accept Linux usernames that contain `@` or start with a digit. Domain logins (a numeric ID followed by `@` and the domain) are rejected, so each person needs a separate local account whose name starts with a letter.

```bash
U=username                                   # must start with a letter; no @
sudo useradd -m -s /bin/bash "$U"
sudo passwd "$U"                             # set the user's password (only used for sudo)
sudo usermod -aG sudo "$U"                   # optional; lets the user run sudo
sudo install -d -m 700 -o "$U" -g "$U" /home/$U/.ssh
grep cert-authority ~/.ssh/authorized_keys \
  | sed -E "s/:login:[^\"]+\"/:login:$U\"/" \
  | sudo tee /home/$U/.ssh/authorized_keys >/dev/null
sudo chown "$U:$U" /home/$U/.ssh/authorized_keys
sudo chmod 600 /home/$U/.ssh/authorized_keys
sudo grep -c ":login:$U\"" /home/$U/.ssh/authorized_keys     # should print 1
```

## 7. Grant access

```bash
brev grant-ssh --org <org-name> --node <node-name> \
  --user <their-brev-email> --linux-user "$U" \
  --port-id <nport-ID> --approve
```

- `--port-id` is the `nport-...` ID from `brev ports ls`, not `22` or the public port.
- Replace every `<...>` with a real value. Bash reads `<` as a redirect and fails with `No such file or directory`.
- To list or remove grants, run `brev revoke-ssh` with no arguments.

## 8. Connect (each person, from their own computer)

```bash
brev login
brev refresh
brev shell <node-name>       # shows: Resolved SSH target: <linux-user>@global.prd.ga.run.brev.nvidia.com:<port>
```

## Example: installing a Brev launchable on the VDI

How to install a Brev launchable (a repository with a `setup.sh`) on a UDESC VDI. Replace `<machine>` with the SSH alias or hostname of the machine.

### A. Prepare the machine (one time, needs your password)

1. Log in and check that the GPU is usable. The output must list your NVIDIA GPU. An extra `llvmpipe` line is harmless.

   ```bash
   ssh -t <machine>
   sudo apt-get install -y vulkan-tools && vulkaninfo --summary | grep deviceName
   ```

2. Create `/data`, so the paths match the Brev launchable:

   ```bash
   sudo mkdir -p /data && sudo chown $USER:$USER /data
   ```

3. Add temporary passwordless sudo, so the long install doesn't stall on a password prompt:

   ```bash
   echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/launchable-setup
   ```

   :::warning
   This rule is temporary. Remove it when the install is done (step 6).
   :::

4. Ask whoever manages the VDI whether the vGPU license is valid and will be renewed before it expires.

### B. Install and finish

1. Download the launchable's `setup.sh` and patch its `apt-get install -y` line to add `--no-install-recommends`. Without it, the script can pull in `lightdm` and replace the VDI's `gdm3`.

   ```bash
   cd /data
   curl -fsSL <setup-script-url> \
     | sed 's/apt-get install -y /apt-get install -y --no-install-recommends /' > setup-patched.sh
   grep -n "no-install-recommends" setup-patched.sh     # should print the patched line
   ```

2. Run it detached. It can take 15 to 30 minutes. If the script reads an install-prefix variable, set it to `/data` on the same line.

   ```bash
   cd /data && setsid nohup bash setup-patched.sh > setup-nohup.log 2>&1 &
   ```

3. Follow the progress until the script prints its final "done" line:

   ```bash
   tail -f <setup-log-file>
   ```

4. Verify the install with the launchable's own check, such as listing its tools or running its first demo.

5. Reach the web services (for example a desktop on port 6080 or reports on port 8300) only through an SSH tunnel, never as open ports:

   ```bash
   ssh -L 6080:localhost:6080 -L 8300:localhost:8300 <machine>
   ```

6. Remove the temporary sudo rule:

   ```bash
   sudo rm /etc/sudoers.d/launchable-setup
   ```

## Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| `api key auth is scoped…`, or the grant is denied | `BREV_API_KEY` is set | `unset BREV_API_KEY`, then `brev login` |
| Node shows `Disconnected` | NetBird never ran `up` successfully | [Steps 2 and 3](#2-install-netbird-first-apt-package-not-snap), then register again |
| `setup command failed: exit status 127` | NetBird not installed | [Step 2](#2-install-netbird-first-apt-package-not-snap) |
| `setup command failed: exit status 1` | NetBird can't look up the domain account | [Step 3](#3-domain-accounts-only-netbird-wrapper) |
| `grant-ssh` → `permission_denied: not authorized` | Linux username contains `@` or starts with a digit, or `BREV_API_KEY` is set | Use a local account ([step 6](#6-create-a-local-account-for-each-person)) |
| `no port with id "22"` | Wrong `--port-id` | Use the `nport-...` ID from `brev ports ls` |
| `bash: …: No such file or directory` | A `<placeholder>` was pasted as typed | Replace it with the real value |
| `brev shell` → `Permission denied (publickey,password)` | That Linux user doesn't exist, or has no CA line for its own name | [Step 6](#6-create-a-local-account-for-each-person), using the username shown in "Resolved SSH target" |
| `brev shell` uses an unexpected username | The grant was made for a different name | `brev revoke-ssh`, then grant again with the right `--linux-user` |
| `bash: /snap/bin/netbird: No such file or directory` | The shell remembers the old snap path | `hash -r`, or open a new terminal |

### Things to know

- **`brev deregister` uninstalls NetBird** and deletes `/etc/netbird` and `/var/lib/netbird`. Before registering again, run `sudo apt install --reinstall netbird` and `sudo systemctl enable --now netbird`. Otherwise Brev sees the wrapper, assumes NetBird is installed and skips installing it.
- **Registering again changes the node ID and the port ID.** Redo [step 6](#6-create-a-local-account-for-each-person)'s `authorized_keys` line (it contains the node ID) and the step 7 grants.
- **Keep password logins off.** Brev's certificates are enough, so there's no need to enable `PasswordAuthentication`.
- **Don't run `netbird up` by hand without Brev's arguments.** On its own, it logs in to NetBird's public service instead of Brev's.
