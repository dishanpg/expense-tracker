#!/usr/bin/env bash
#
# Idempotent first-boot setup for the BE on a fresh Ubuntu 22.04 EC2 host.
# Safe to re-run: every step checks before mutating state.
#
# Usage:
#   scp BE/scripts/bootstrap-ec2.sh ubuntu@<ec2-host>:~/
#   ssh ubuntu@<ec2-host>
#   CERTBOT_EMAIL=you@example.com bash bootstrap-ec2.sh \
#     git@github.com:<you>/<repo>.git api.yourdomain.com
#
# After this finishes, populate ~/app/BE/.env (or rely on CI to write it from
# the BE_ENV GitHub Secret) and run: cd ~/app/BE && yarn deploy:server

set -euo pipefail

REPO_URL="${1:?Usage: bootstrap-ec2.sh <repo-url> <api-domain>}"
API_DOMAIN="${2:?Usage: bootstrap-ec2.sh <repo-url> <api-domain>}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@${API_DOMAIN}}"

echo "==> 1/6 Installing apt packages"
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx git curl

echo "==> 2/6 Installing Node 20 (skip if already on v20)"
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v20'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> 3/6 Installing pm2 and yarn globally"
sudo npm i -g pm2 yarn

echo "==> 4/6 Cloning repo into ~/app (skip if already present)"
if [ ! -d "$HOME/app/.git" ]; then
  git clone "$REPO_URL" "$HOME/app"
fi

echo "==> 5/6 Configuring nginx reverse proxy for $API_DOMAIN"
NGINX_SITE="/etc/nginx/sites-available/expense-tracker"
if [ ! -f "$NGINX_SITE" ]; then
  sudo tee "$NGINX_SITE" > /dev/null <<EOF
server {
    listen 80;
    server_name ${API_DOMAIN};

    # Increase if you ever upload large files; 1m is fine for JSON APIs.
    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90;
    }
}
EOF
  sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/expense-tracker
  sudo rm -f /etc/nginx/sites-enabled/default
fi
sudo nginx -t
sudo systemctl reload nginx

echo "==> 6/6 Provisioning Let's Encrypt cert (idempotent — certbot skips if valid)"
# Requires DNS for $API_DOMAIN to already point at this host.
sudo certbot --nginx --non-interactive --agree-tos \
  --email "$CERTBOT_EMAIL" -d "$API_DOMAIN" --redirect || {
  echo "certbot failed. Verify DNS for $API_DOMAIN points to this EC2 IP, then re-run:"
  echo "  sudo certbot --nginx -d $API_DOMAIN"
}

echo ""
echo "================================================================"
echo "Bootstrap complete."
echo ""
echo "Next steps:"
echo "  1. Populate ~/app/BE/.env (or push to main and let CI write it"
echo "     from the BE_ENV GitHub Secret on the next deploy)."
echo "  2. cd ~/app/BE && yarn deploy:server"
echo "  3. pm2 save && pm2 startup"
echo "     (run the printed sudo command so pm2 survives reboots)"
echo "================================================================"
