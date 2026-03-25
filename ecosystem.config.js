module.exports = {
  apps: [
    {
      name: 'vexcraft-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/.openclaw/workspace/vexcraft/hemsida',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'email-orchestrator',
      script: './dist/services/email-orchestrator.js',
      cwd: '/root/.openclaw/workspace/vexcraft/hemsida',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/root/.openclaw/workspace/vexcraft/hemsida/logs/email-orchestrator-error.log',
      out_file: '/root/.openclaw/workspace/vexcraft/hemsida/logs/email-orchestrator-out.log',
      time: true,
    },
  ],
};
