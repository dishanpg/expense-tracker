# Deployment Runbook

Single source of truth for deploying the expense tracker. **One-time setup is manual; every release after that is just `git push origin main`.**

---

## Architecture

```
yourdomain.com         →  AWS Amplify (FE, React/Vite SPA)
api.yourdomain.com     →  EC2 t2.micro → nginx → pm2 cluster (NestJS, 2 workers)
                          └─ TLS via TiDB Serverless (MySQL-compatible, 5 GB free)
```

CI/CD:
- **FE**: Amplify watches `main`, rebuilds and deploys automatically on every push (no workflow file needed).
- **BE**: `.github/workflows/deploy-be.yml` runs on every push to `main` that touches `BE/**`. It validates the build on a GH runner, then SSHes into EC2, syncs `.env`, runs migrations, reloads pm2, and verifies `/healthcheck` responds.

---

## One-time setup (do this once, never again)

### 1. TiDB Serverless

1. Sign up at <https://tidbcloud.com> → create a **Serverless** cluster (region matching your EC2, e.g. `aws-us-east-1`).
2. Set a root password, allow `0.0.0.0/0` initially (lock down to the EC2 Elastic IP later).
3. Save the connection params (host, port `4000`, user, password).
4. Connect via the in-browser SQL shell and run:
   ```sql
   CREATE DATABASE expense_tracker;
   ```

### 2. EC2

1. Launch **t2.micro** (Free Tier), Ubuntu 22.04 LTS, 8 GB gp3, in the same region as TiDB.
2. Allocate an **Elastic IP** and attach it.
3. Security Group inbound: `22` from your IP, `80` and `443` from anywhere.
4. Add an `A` record at your DNS provider: `api.yourdomain.com` → Elastic IP. Wait for propagation.
5. SSH in and run the bootstrap script:
   ```bash
   scp BE/scripts/bootstrap-ec2.sh ubuntu@<elastic-ip>:~/
   ssh ubuntu@<elastic-ip>
   CERTBOT_EMAIL=you@example.com bash bootstrap-ec2.sh \
     git@github.com:<you>/<repo>.git api.yourdomain.com
   ```
   The script is idempotent — re-run safely if anything fails partway.

### 3. GitHub Secrets

Repo → Settings → Secrets and variables → Actions → **New repository secret**:

| Name | Value |
|---|---|
| `EC2_HOST` | EC2 Elastic IP (e.g. `54.123.45.67`) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of the **private** key for an SSH user authorized on EC2. Generate a deploy keypair (`ssh-keygen -t ed25519 -C "gh-deploy" -f deploy_key`), append `deploy_key.pub` to `~/.ssh/authorized_keys` on EC2, and paste the contents of `deploy_key` here. |
| `BE_ENV` | The full contents of the BE `.env` file (multi-line). See template below. |

`BE_ENV` template — paste this into the secret with your real values:
```
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USERNAME=<tidb_user>
DB_PASSWORD=<tidb_password>
DB_NAME=expense_tracker
DB_SSL=true
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

### 4. AWS Amplify (FE)

1. AWS Console → **Amplify** → **Host web app** → connect GitHub → pick repo + `main`.
2. Set **app root directory** to `FE/`. Build spec is auto-detected from `FE/amplify.yml`.
3. Environment variables: `VITE_API_URL=https://api.yourdomain.com`.
4. Rewrites and redirects → add this rule for SPA fallback:
   ```
   Source:  </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
   Target:  /index.html
   Type:    200 (Rewrite)
   ```
5. Domain management → add `yourdomain.com` (and `www.yourdomain.com`). Add the CNAME/ALIAS records Amplify generates at your DNS provider. SSL is automatic.

### 5. First deploy

Push any commit to `main`. Both FE (Amplify) and BE (GH Actions) deploy automatically. Watch the Actions tab for the BE workflow; the health check at the end confirms the new process responds.

---

## Releasing a new feature (the steady state)

```bash
git checkout -b feature/x
# ...code...
git push origin feature/x
# Open PR, merge to main
```

That's it. On merge to `main`:
- Amplify rebuilds and redeploys the FE.
- GH Actions validates the BE build, SSHes to EC2, pulls, installs deps, runs migrations, reloads pm2, verifies `/healthcheck`.

### When the feature adds a new env var

1. Update the `BE_ENV` secret in GitHub (Settings → Secrets and variables → Actions → `BE_ENV` → Update).
2. Push your code change.
3. The workflow rewrites `.env` from the secret on every deploy, so the new var is picked up automatically.

### When the feature adds a new dependency

Nothing extra — `yarn install --frozen-lockfile` runs every deploy and picks up the new dep from `yarn.lock`.

### When the feature adds a new migration

Nothing extra — `yarn migration:run` runs every deploy. If the migration fails, the workflow halts before reloading pm2 (the old version stays serving traffic).

---

## Rolling back

The fastest, safest rollback is `git revert`:

```bash
git revert <bad-commit-sha>
git push origin main
```

This triggers the same CI/CD path with the reverted code. Both FE and BE roll back together. Typical end-to-end time: 2–4 minutes.

If the bad commit broke the deploy itself (rare, validate job catches most of these), SSH in and reset to the previous good commit:

```bash
ssh ubuntu@<ec2-host>
cd ~/app
git log --oneline -10           # find last good commit
git reset --hard <good-sha>
cd BE
yarn deploy:server
```

---

## Troubleshooting

**Workflow fails at "Healthcheck failed after 60s"**
The deploy succeeded but the new process can't serve traffic. Last 50 lines of pm2 logs are printed in the workflow output. Common causes:
- Missing env var (update `BE_ENV` secret, re-run workflow)
- Migration error (check pm2 logs, fix migration, push)
- DB connection refused (verify TiDB allowlist includes EC2 IP)

**Workflow fails at validate job (`yarn build`)**
Pure code/type error. Fix locally, push again. Prod is untouched.

**FE loads but API calls 502 / fail**
- Check `https://api.yourdomain.com/healthcheck` directly. If down, SSH in and `pm2 logs`.
- Check Amplify env var `VITE_API_URL` is `https://api.yourdomain.com` (no trailing slash).
- Check CORS — `CORS_ORIGIN` in `BE_ENV` must include `https://yourdomain.com` exactly.

**Certbot cert expiring**
Certbot installs a systemd timer that auto-renews. To verify:
```bash
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

---

## Costs

| | First 12 mo | After 12 mo |
|---|---|---|
| EC2 t2.micro + Elastic IP (attached) + 8 GB EBS | $0 | ~$8.50/mo |
| Amplify Hosting | $0 | $0 |
| TiDB Serverless | $0 | $0 |
| **Total** | **~$0** | **~$8.50/mo** |

Set a calendar reminder ~11 months from EC2 launch to either accept the ongoing ~$8.50/mo or migrate the BE to Lambda + API Gateway (perpetual free tier, but requires a `@vendia/serverless-express` adapter).

---

## Known limitations (acceptable for MVP, address before scaling)

- **No auth** — endpoints are open. Add `@nestjs/passport` + JWT before real users sign up.
- **Single EC2** — no HA. For uptime SLAs, move to ALB + Auto Scaling Group or App Runner.
- **`pm2 save` writes to ~/.pm2** — survives reboots only after `pm2 startup` is run once during bootstrap. The bootstrap script reminds you.
- **`BE_ENV` is a single secret** — fine for MVP, but you can't grant per-env-var access. If you need finer-grained secret management, migrate to AWS Systems Manager Parameter Store.
