# SSH Key Setup Guide for GitHub Secrets

## Issue
When copying SSH private keys from Windows to GitHub Secrets, formatting issues can occur that prevent the keys from working.

## Solution

### Option 1: Use PowerShell to Copy Key (Recommended for Windows)

```powershell
# Read the key file and copy to clipboard
Get-Content C:\path\to\your\key.pem | Set-Clipboard

# Then paste into GitHub Secrets
```

### Option 2: Manually Format the Key

Your SSH private key should look like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
... (multiple lines of base64)
...
-----END RSA PRIVATE KEY-----
```

OR for newer OpenSSH format:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEA...
... (multiple lines of base64)
...
-----END OPENSSH PRIVATE KEY-----
```

### Important Rules:
1. Include the `-----BEGIN...-----` and `-----END...-----` lines
2. Each line should be on its own line (no extra line breaks within the base64 content)
3. No extra spaces at the beginning or end
4. No Windows line endings (CRLF) - the workflow now handles this automatically

### Option 3: Convert Key Format (if needed)

If your key is in a different format, convert it using ssh-keygen:

```bash
# Convert to PEM format
ssh-keygen -p -m PEM -f your-key.pem
```

### Testing Your Key Locally

Before adding to GitHub Secrets, test it locally:

```bash
# Test the key can be read
ssh-keygen -l -f your-key.pem

# Test SSH connection
ssh -i your-key.pem user@host
```

## GitHub Secrets Setup

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

- `JUMP_SERVER_KEY` - Your jump server private key (full content)
- `JUMP_SERVER_HOST` - Jump server IP or hostname
- `JUMP_SERVER_USER` - Jump server username (e.g., ubuntu, ec2-user)
- `TARGET_EC2_KEY` - Your target EC2 private key (full content)
- `TARGET_EC2_HOST` - Target EC2 IP or hostname
- `TARGET_EC2_USER` - Target EC2 username
- `ENV_FILE` - Your .env file content with all environment variables

## Common Errors

### "is not a key file"
- Key is corrupted or in wrong format
- Missing BEGIN/END headers
- Extra whitespace or line breaks

### "Load key: invalid format"
- Key has Windows line endings (CRLF) - workflow now fixes this
- Key is encrypted with a passphrase (remove passphrase first)

### "Permission denied (publickey)"
- Wrong public key installed on server
- Check that the public key (.pub) is in `~/.ssh/authorized_keys` on the target server
