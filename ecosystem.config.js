module.exports = {
  apps: [{
    name: 'medicare-ai',
    script: 'backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/home/medicare/logs/medicare-ai-error.log',
    out_file: '/home/medicare/logs/medicare-ai-out.log',
    log_file: '/home/medicare/logs/medicare-ai-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 5000,
    wait_ready: true,
    
    // Health check
    health_check: {
      url: 'http://localhost:3002/health',
      max_tries: 3,
      interval: 5000
    }
  }]
};