# Cloudflare Tunnel - Permanent Setup Guide

## 🎉 Current Status

✅ **Temporary tunnel working!**
- URL: `https://representatives-currency-parking-investigated.trycloudflare.com`
- Portfolio updated and deployed
- HTTPS working, no Mixed Content errors

## ⚠️ Problem with Current Setup

The **quick tunnel** you created is **temporary**:
- URL changes every time the service restarts
- No uptime guarantee
- Cloudflare can shut it down anytime

**For production, you need a NAMED/PERSISTENT tunnel.**

---

## 🚀 Setting Up a Permanent Cloudflare Tunnel

### Benefits
- ✅ **Stable URL** that never changes
- ✅ **Custom domain** (api.pantal.dev)
- ✅ **Better reliability** and uptime
- ✅ **Free** (same as quick tunnel)
- ✅ **Management dashboard**

---

## 📋 Prerequisites

1. **Cloudflare account** (free) - [Sign up](https://dash.cloudflare.com/sign-up)
2. **(Optional) Domain managed by Cloudflare** - If you want `api.pantal.dev`

---

## Step-by-Step Setup

### Step 1: Create Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up (free account is fine)
3. **Optional:** Add your domain `pantal.dev` to Cloudflare
   - Update nameservers at your registrar
   - Wait for DNS propagation (~1 hour)

---

### Step 2: Login to Cloudflare on Server

SSH to your server:

```bash
ssh root@167.99.139.139
```

Authenticate cloudflared:

```bash
cloudflared tunnel login
```

This will:
- Open a browser window
- Ask you to select a domain (or skip if not using custom domain)
- Download a certificate to `~/.cloudflared/cert.pem`

---

### Step 3: Create a Named Tunnel

```bash
# Create tunnel named "project-tracker"
cloudflared tunnel create project-tracker
```

Output will show:
```
Tunnel credentials written to /root/.cloudflared/<TUNNEL-ID>.json
Created tunnel project-tracker with id <TUNNEL-ID>
```

**Save this tunnel ID!** You'll need it.

---

### Step 4: Configure the Tunnel

Create config file:

```bash
sudo nano ~/.cloudflared/config.yml
```

Add this configuration:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /root/.cloudflared/<YOUR-TUNNEL-ID>.json

ingress:
  # Route for your API
  - hostname: api.pantal.dev  # Or any subdomain you want
    service: http://localhost:8002
  
  # Catch-all rule (required)
  - service: http_status:404
```

**If you don't have a custom domain**, use this instead:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /root/.cloudflared/<YOUR-TUNNEL-ID>.json

ingress:
  # Use Cloudflare's auto-generated domain
  - service: http://localhost:8002
```

---

### Step 5: Create DNS Record (If Using Custom Domain)

If you're using `api.pantal.dev`:

```bash
# Replace <TUNNEL-ID> with your actual tunnel ID
cloudflared tunnel route dns project-tracker api.pantal.dev
```

This creates a CNAME record: `api.pantal.dev` → `<TUNNEL-ID>.cfargotunnel.com`

---

### Step 6: Update Systemd Service

Stop the quick tunnel:

```bash
sudo systemctl stop cloudflared-tunnel
```

Update the service file:

```bash
sudo nano /etc/systemd/system/cloudflared-tunnel.service
```

Change to:

```ini
[Unit]
Description=Cloudflare Tunnel for Project Tracker API
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /root/.cloudflared/config.yml run project-tracker
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart cloudflared-tunnel
sudo systemctl status cloudflared-tunnel
```

---

### Step 7: Test the Tunnel

**If using custom domain:**
```bash
curl https://api.pantal.dev/public/projects
```

**If using Cloudflare domain:**
Check the tunnel URL in Cloudflare dashboard or logs:
```bash
sudo journalctl -u cloudflared-tunnel -f
```

Look for line like:
```
https://<YOUR-TUNNEL-ID>.cfargotunnel.com registered
```

Test it:
```bash
curl https://<YOUR-TUNNEL-ID>.cfargotunnel.com/public/projects
```

---

### Step 8: Update Portfolio

Update `.env.local`:

**With custom domain:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.pantal.dev
```

**Without custom domain:**
```env
NEXT_PUBLIC_API_BASE_URL=https://<YOUR-TUNNEL-ID>.cfargotunnel.com
```

Rebuild and deploy:

```bash
npm run build
git add .
git commit -m "Update to permanent Cloudflare Tunnel URL"
git push
```

---

## 🎯 Quick Commands Summary

```bash
# 1. SSH to server
ssh root@167.99.139.139

# 2. Login to Cloudflare
cloudflared tunnel login

# 3. Create named tunnel
cloudflared tunnel create project-tracker

# 4. Create config
sudo nano ~/.cloudflared/config.yml
# (paste config from Step 4)

# 5. Create DNS record (if using custom domain)
cloudflared tunnel route dns project-tracker api.pantal.dev

# 6. Update systemd service
sudo nano /etc/systemd/system/cloudflared-tunnel.service
# (paste service file from Step 6)

# 7. Restart service
sudo systemctl daemon-reload
sudo systemctl restart cloudflared-tunnel
sudo systemctl status cloudflared-tunnel

# 8. Test
curl https://api.pantal.dev/public/projects
# OR
curl https://<TUNNEL-ID>.cfargotunnel.com/public/projects
```

---

## 🔍 Verifying It Works

### Check Tunnel Status

```bash
# View tunnel status
cloudflared tunnel list

# Check service logs
sudo journalctl -u cloudflared-tunnel -f

# Test endpoint
curl https://api.pantal.dev/public/projects | jq
```

### Check Portfolio

1. Wait for GitHub Pages deployment (~2 min)
2. Visit `https://pantal.dev/projects`
3. Open DevTools (F12) → Console
4. Should see:
   - ✅ No "Mixed Content" errors
   - ✅ Fetch from `https://api.pantal.dev` succeeds
   - ✅ Projects load from live API

---

## 📊 Comparison

| Feature | Quick Tunnel | Named Tunnel |
|---------|--------------|--------------|
| **URL** | Changes on restart | Permanent |
| **Custom Domain** | ❌ No | ✅ Yes |
| **Reliability** | Low | High |
| **Management** | None | Cloudflare Dashboard |
| **Cost** | Free | Free |
| **Setup Time** | 1 minute | 15 minutes |
| **Production Ready** | ❌ No | ✅ Yes |

---

## 🆘 Troubleshooting

### Tunnel won't start

```bash
# Check logs
sudo journalctl -u cloudflared-tunnel -n 50

# Verify config
cloudflared tunnel info project-tracker

# Test config file
cloudflared tunnel --config ~/.cloudflared/config.yml run project-tracker
```

### DNS not resolving

```bash
# Check DNS
nslookup api.pantal.dev

# List tunnel routes
cloudflared tunnel route dns list
```

### Still getting Mixed Content errors

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check .env.local has HTTPS URL
- Rebuild portfolio

---

## 🎉 After Setup Complete

Your portfolio will have:
- ✅ Real-time updates from Project Manager
- ✅ Secure HTTPS connection
- ✅ Stable, permanent API URL
- ✅ No Mixed Content errors
- ✅ Production-ready setup

**No need for:**
- ❌ SSL certificates
- ❌ Nginx HTTPS configuration
- ❌ Port forwarding
- ❌ Firewall rules for port 443

Cloudflare handles all of that! 🎉

---

## 📚 Additional Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Tunnel Configuration Reference](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/local-management/configuration-file/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

---

**Ready to set up the permanent tunnel? Follow the steps above and let me know if you need any help!**
