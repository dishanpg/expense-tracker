module.exports = {
  apps: [
    {
      name: "expense-tracker-api",
      script: "dist/main.js",
      // Cluster mode with 2 workers gives true zero-downtime rolling reloads:
      // pm2 reload restarts workers one at a time so there's always one serving traffic.
      // 2 instances * ~150-200 MB fits comfortably on a t2.micro (1 GB RAM).
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "350M",
      autorestart: true,
      // Give workers up to 5s to drain in-flight requests before SIGKILL.
      kill_timeout: 5000,
      // pm2 considers the worker healthy as soon as it `listen()`s.
      listen_timeout: 10000,
    },
  ],
};
