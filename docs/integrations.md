# WhatsApp & Instagram Messaging API — Setup Guide

This guide walks you through setting up the WhatsApp Business Platform and Instagram Messaging API from scratch, step by step.

---

## Part A: WhatsApp Business Platform Setup

### Prerequisites
- A Facebook account
- A phone number that is NOT already registered with WhatsApp or WhatsApp Business app
- A business website or social media presence

---

### Step 1: Create a Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com/)
2. Click **"Create Account"**
3. Enter your business details:
   - Business name: **Aazhi Designer Studio**
   - Your name
   - Business email
4. Complete verification steps
5. **Note down** your **Business Account ID** (found in Business Settings → Business Info)

---

### Step 2: Create a Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Click **"Get Started"** or **"My Apps"**
3. If prompted, register as a developer:
   - Accept the Meta Platform Terms
   - Verify your account (phone/email)
4. You are now a Meta Developer

---

### Step 3: Create a Meta App

1. In the [Meta Developer Dashboard](https://developers.facebook.com/apps/), click **"Create App"**
2. Select app type: **"Business"**
3. Fill in:
   - App name: `Aazhi Designer Studio`
   - App contact email: your email
   - Business Account: Select the one created in Step 1
4. Click **"Create App"**
5. **Note down** your **App ID** and **App Secret** (Settings → Basic)

---

### Step 4: Add WhatsApp Product to Your App

1. In your app dashboard, scroll to **"Add Products"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. You'll be taken to the WhatsApp Getting Started page
4. Meta provides a **test phone number** and **temporary access token** — these are for testing only

---

### Step 5: Add a Business Phone Number

1. Go to **WhatsApp → Getting Started** in your app dashboard
2. Click **"Add phone number"**
3. Enter:
   - Display name: `Aazhi Designer Studio`
   - Phone number: Your dedicated business number
4. Choose verification method: **SMS** or **Voice call**
5. Enter the OTP code
6. **Note down** your:
   - **Phone Number ID** (displayed after verification)
   - **WhatsApp Business Account ID** (WABA ID)

> [!CAUTION]
> The phone number you register here will be REMOVED from the regular WhatsApp app. Use a dedicated business number, NOT your personal number.

---

### Step 6: Generate a Permanent Access Token

The test token expires in 24 hours. For production, create a permanent **System User Token**:

1. Go to [business.facebook.com](https://business.facebook.com/)
2. Navigate to **Business Settings → Users → System Users**
3. Click **"Add"** to create a new System User:
   - Name: `aazhi-whatsapp-bot`
   - Role: **Admin**
4. Click **"Add Assets"**:
   - Select **Apps** → Your app → Enable **Full Control**
   - Select **WhatsApp Accounts** → Your WABA → Enable **Full Control**
5. Click **"Generate New Token"**:
   - Select your app
   - Select permissions:
     - `whatsapp_business_management`
     - `whatsapp_business_messaging`
   - Click **"Generate Token"**
6. **Copy and securely store** the token immediately — it won't be shown again

> [!IMPORTANT]
> Store this token in your `.env` file as `WHATSAPP_ACCESS_TOKEN`. NEVER commit it to source control.

---

### Step 7: Configure Webhooks

This allows your app to receive incoming messages.

1. In your app dashboard, go to **WhatsApp → Configuration**
2. Under **Webhook**, click **"Edit"**
3. Enter:
   - **Callback URL**: `https://yourdomain.com/api/webhooks/whatsapp`
   - **Verify Token**: A random string you create (e.g., `aazhi_whatsapp_verify_2026`)
4. Click **"Verify and Save"**
   - Your server must respond to the GET verification request (our app handles this automatically)
5. Under **Webhook Fields**, subscribe to:
   - `messages` ✅
   - `messaging_postbacks` ✅ (optional)

> [!NOTE]
> Your app must be deployed and accessible at the callback URL before you can verify the webhook. Use ngrok for local testing: `ngrok http 3000`

---

### Step 8: Request Production Access

Test mode limits you to 5 pre-approved phone numbers.

1. Go to **WhatsApp → API Setup**
2. Click **"Request Production Access"** (or go to **App Review**)
3. You'll need:
   - A verified Meta Business Account
   - A privacy policy URL
   - Business verification documents
4. Once approved, you can message any WhatsApp user who messages you first

---

### Step 9: Configure in Aazhi Designer Studio

Add these to your `.env` file:

```env
WHATSAPP_ACCESS_TOKEN="your-permanent-system-user-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-waba-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="aazhi_whatsapp_verify_2026"
```

Then in the app Settings → Communication → WhatsApp:
- Toggle WhatsApp integration **ON**
- The app will start receiving real messages in the unified inbox

---

## Part B: Instagram Messaging API Setup

### Prerequisites
- An Instagram **Business** or **Creator** account
- A Facebook Page connected to the Instagram account
- The Meta App created above (same app works for both)

---

### Step 1: Convert to Instagram Business Account

If not already done:

1. Open the **Instagram app**
2. Go to **Settings → Account → Switch to Professional Account**
3. Choose **Business**
4. Connect to your **Facebook Page** (Aazhi Designer Studio)

---

### Step 2: Connect Instagram to Your Facebook Page

1. Go to your Facebook Page **Settings**
2. Click **"Linked Accounts"** or **"Instagram"**
3. Click **"Connect Account"**
4. Log in to Instagram and authorize

---

### Step 3: Add Instagram Messaging to Your Meta App

1. In the [Meta Developer Dashboard](https://developers.facebook.com/apps/), open your app
2. Click **"Add Products"**
3. Find **"Instagram"** and click **"Set Up"**
4. Go to **Instagram → Basic Display** or **Instagram → Messaging**

---

### Step 4: Configure Instagram Messaging Permissions

1. Go to **App Review → Permissions and Features**
2. Request the following permissions:
   - `instagram_manage_messages` — Read and respond to DMs
   - `instagram_basic` — Basic account info
   - `pages_manage_metadata` — Required for webhook subscriptions
   - `pages_messaging` — Send/receive messages via Page
3. Submit for review with:
   - Explanation of how you'll use messaging (customer enquiries, order updates)
   - A screencast demonstrating the message flow
   - Privacy policy URL

---

### Step 5: Generate Instagram Access Token

Use the same System User token from the WhatsApp setup (if it has Instagram permissions), or generate a new Page Token:

1. Go to **Graph API Explorer** at [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Get a **Page Access Token** for the Facebook Page connected to your Instagram
4. Exchange for a **long-lived token**:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={short-lived-token}
   ```
5. Get the Instagram Business Account ID:
   ```
   GET /{page-id}?fields=instagram_business_account
   ```

---

### Step 6: Configure Instagram Webhooks

1. In your app dashboard, go to **Webhooks**
2. Select **Instagram** from the dropdown
3. Click **"Subscribe to this object"**
4. Enter:
   - **Callback URL**: `https://yourdomain.com/api/webhooks/instagram`
   - **Verify Token**: A random string (e.g., `aazhi_instagram_verify_2026`)
5. Subscribe to:
   - `messages` ✅
   - `messaging_postbacks` ✅

---

### Step 7: Configure in Aazhi Designer Studio

Add to your `.env` file:

```env
INSTAGRAM_ACCESS_TOKEN="your-page-or-system-user-token"
INSTAGRAM_PAGE_ID="your-facebook-page-id"
INSTAGRAM_BUSINESS_ACCOUNT_ID="your-ig-business-account-id"
INSTAGRAM_APP_SECRET="your-app-secret"
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="aazhi_instagram_verify_2026"
```

---

## Part C: Testing Without Real Credentials

Until you complete the above setup, Aazhi Designer Studio uses **mock adapters** that:

- Simulate incoming messages in the unified inbox
- Log outgoing messages to the console/database instead of sending them
- Allow you to test the entire conversation → lead → order workflow
- Display a clear **"MOCK MODE"** indicator in the inbox

To switch from mock to real:

1. Add the real credentials to `.env`
2. Set `WHATSAPP_ENABLED=true` and/or `INSTAGRAM_ENABLED=true`
3. Restart the application
4. Deploy and verify webhooks

---

## Part D: Local Testing with ngrok

When testing webhooks locally:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your app: `npm run dev`
3. Start ngrok: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Use this as your webhook callback URL in Meta Developer Dashboard
6. Remember to update the URL each time you restart ngrok (unless on a paid plan)

---

## Quick Reference: All Required Environment Variables

| Variable | Where to Find |
|:---|:---|
| `WHATSAPP_ACCESS_TOKEN` | Business Settings → System Users → Generate Token |
| `WHATSAPP_PHONE_NUMBER_ID` | App Dashboard → WhatsApp → Getting Started |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | App Dashboard → WhatsApp → Getting Started |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | You create this (any random string) |
| `INSTAGRAM_ACCESS_TOKEN` | Graph API Explorer → Page Token → Exchange for long-lived |
| `INSTAGRAM_PAGE_ID` | Facebook Page Settings → About → Page ID |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Graph API: `GET /{page-id}?fields=instagram_business_account` |
| `INSTAGRAM_APP_SECRET` | App Dashboard → Settings → Basic → App Secret |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | You create this (any random string) |

---

## Estimated Timeline

| Task | Time |
|:---|:---|
| Meta Business Account setup | 15 minutes |
| Developer Account + App creation | 15 minutes |
| WhatsApp setup + test number | 30 minutes |
| Permanent token generation | 15 minutes |
| Instagram Business Account | 10 minutes |
| Facebook Page linking | 10 minutes |
| Instagram messaging permissions | 15 minutes + review wait |
| Webhook configuration | 15 minutes |
| **Meta Business Verification** | **1–5 business days** |
| **App Review (Instagram messaging)** | **2–10 business days** |

> [!WARNING]
> Meta Business Verification and App Review can take days to weeks. Start this process as early as possible, even while using mock adapters for development.
