# Email Queue Setup - Environment Configuration

This file provides a template for the required environment variables to enable email queuing with BullMQ and Upstash Redis.

## Required Variables

Add these to your `.env` file:

```bash
# ==================================
# Upstash Redis Configuration
# ==================================
# Get this from: https://upstash.com/ > Your Database > Details
# Format: rediss://default:PASSWORD@REGION.upstash.io:6379
REDIS_URL=rediss://default:your_password_here@region.upstash.io:6379

# ==================================
# Email Queue Rate Limiting
# ==================================
# Control how fast emails are sent to avoid Resend rate limits
# Default: 10 emails per minute

# Maximum number of emails to send per duration
EMAIL_QUEUE_RATE_LIMIT=10

# Duration in milliseconds (60000 = 1 minute)
EMAIL_QUEUE_RATE_DURATION=60000

# ==================================
# Resend Configuration (Existing)
# ==================================
# These should already be in your .env file
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# RESEND_SENDER_EMAIL=noreply@yourdomain.com
# CLIENT_URL=http://localhost:3000
```

## Rate Limiting Examples

### Conservative (Resend Free Tier: 100 emails/day)

```bash
EMAIL_QUEUE_RATE_LIMIT=4         # 4 emails
EMAIL_QUEUE_RATE_DURATION=3600000 # per hour
```

### Balanced (Default - handles bursts)

```bash
EMAIL_QUEUE_RATE_LIMIT=10        # 10 emails
EMAIL_QUEUE_RATE_DURATION=60000  # per minute
```

### High Volume (for paid Resend plans)

```bash
EMAIL_QUEUE_RATE_LIMIT=100       # 100 emails
EMAIL_QUEUE_RATE_DURATION=60000  # per minute
```

## Upstash Redis Setup Steps

1. **Create Account**: Go to [https://upstash.com/](https://upstash.com/) and sign up
2. **Create Database**:
   - Click "Create Database"
   - Choose "Regional" (free tier)
   - Select region closest to your server
3. **Get Redis URL**:
   - Go to database dashboard
   - Copy the "Redis URL" from connection details
4. **Add to .env**: Paste the URL as `REDIS_URL` value

## Testing Without Redis

If you don't configure `REDIS_URL`, the application will still work:

- Emails will be sent **synchronously** (old behavior)
- You'll see warning: "Email queue will not be available"
- Good for local development/testing
- Not recommended for production with high volume
