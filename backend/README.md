# 🔐 Secure Portfolio Backend

This backend provides full security features for your portfolio:
- HTTPS (self-signed for dev, Let's Encrypt for prod)
- Two-Factor Authentication (TOTP)
- Audit Logs (all admin actions)
- Encryption (sensitive data encrypted)
- Automatic Backups (daily)
- IP Restrictions (whitelist)
- Session Timeout (JWT with expiry)
- Password Hashing (bcrypt)
- Database Encryption (AES)
- Disaster Recovery Plan (backups + restore)

## Setup

1. Install Node.js and npm
2. Run `npm install` in the backend folder
3. Copy `.env` and adjust settings (especially JWT_SECRET, ENCRYPT_KEY)
4. Run `npm start` (or `npm run dev` for development)
5. Access admin panel at `http://localhost:3000`
6. Login with default credentials: admin@ridwanfarah.com / ChangeMe123!

## Production Deployment

- For HTTPS: Use Let's Encrypt and set `HTTPS_ENABLED=true` in .env
- Change JWT_SECRET, ENCRYPT_KEY to strong random values
- Set ADMIN_IP_WHITELIST to your office/VPN IPs
- Configure BACKUP_CRON to your desired schedule

## Backup & Restore

- Backups are stored in `backups/` folder (daily)
- Manual backup via admin panel
- To restore: copy the .db file to data/portfolio.db

## Security Checklist

- [x] HTTPS enabled
- [x] 2FA for admin
- [x] Audit logs
- [x] Encryption for sensitive data
- [x] Automatic backups
- [x] IP whitelist
- [x] Session timeout
- [x] Password hashing (bcrypt)
- [x] Database encryption (AES)
- [x] Disaster recovery plan

## Troubleshooting

If you encounter issues with sqlite3, install build tools:
- Windows: `npm install --global windows-build-tools`
- Linux: `sudo apt-get install build-essential`

For more help, contact support.
