# weebly.pro Domain Setup Guide

## Your Setup
- **Domain**: weebly.pro
- **Host**: Vercel
- **Feature**: Landing page builder with wildcard subdomains

---

## ✅ What's Done
- ✅ Code implementation complete
- ✅ Database configured
- ✅ API routes ready
- ✅ Landing page builder ready
- ✅ Environment variables added to `.env`

---

## ⏳ What You Need to Do

### Step 1: Add DNS Wildcard Record
Go to your domain registrar (where you registered weebly.pro):

**Add this CNAME record:**
```
Name:   *.weebly.pro
Type:   CNAME
Value:  cname.vercel.sh
TTL:    3600 (or default)
```

**Popular Registrars:**
- Namecheap → Domain List → Manage → DNS
- GoDaddy → My Products → DNS Management
- Route 53 → Hosted Zones → weebly.pro
- Cloudflare → DNS → Add Record

### Step 2: Configure Vercel Environment Variable
In **Vercel Dashboard**:

1. Go to your project: `nexgenaff`
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `NEXT_PUBLIC_LANDING_PAGE_DOMAIN`
   - **Value**: `weebly.pro`
   - **Environments**: Production, Preview, Development

OR if deploying locally, `.env` is already updated.

### Step 3: Redeploy
- Push code to GitHub/GitLab/Bitbucket
- Vercel auto-deploys, or manually trigger in dashboard
- Wait for deployment to finish

### Step 4: Wait for DNS Propagation
- DNS changes take 24-48 hours to fully propagate
- Test with: `nslookup test.weebly.pro`

### Step 5: Test
1. Go to your app: https://weebly.pro/admin/landing-builder
2. Create a new landing page
3. Subdomain: `test`
4. Add tracking URL
5. Publish
6. Visit: https://test.weebly.pro
7. Should redirect to your tracking URL ✓

---

## 🎯 Result

After setup, your landing pages will be live at:
```
https://summer-sale.weebly.pro
https://black-friday.weebly.pro
https://vip-offer.weebly.pro
https://any-subdomain.weebly.pro
```

Each one redirects to your affiliate/tracking URL.

---

## 📊 Example Workflow

```
Step 1: User Creates Landing Page
  - Subdomain: "summer-sale"
  - Tracking URL: "https://affiliate.com/click?id=123"
  - Template: "Modern Offer"
  - Publish

Step 2: Landing Page Goes Live
  - URL: https://summer-sale.weebly.pro

Step 3: Visitor Clicks
  - Browser requests: summer-sale.weebly.pro
  - DNS resolves *.weebly.pro → Vercel
  - Next.js finds landing page in database
  - Increments click count
  - Redirects to affiliate URL

Step 4: Click Tracked
  - Your database shows +1 click on summer-sale page
  - Affiliate captures the visitor
```

---

## 🔧 Configuration Reference

### `.env` (Development)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=localhost:3000
```

### `.env` (Production in Vercel)
```
NEXT_PUBLIC_APP_URL=https://weebly.pro
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=weebly.pro
```

---

## 🧪 Verification Checklist

- [ ] Added `*.weebly.pro` CNAME record to registrar
- [ ] Waiting for DNS propagation (24-48 hours)
- [ ] Added `NEXT_PUBLIC_LANDING_PAGE_DOMAIN=weebly.pro` to Vercel
- [ ] Redeployed to Vercel
- [ ] Tested with `nslookup test.weebly.pro`
- [ ] Created test landing page
- [ ] Verified redirect works

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Subdomain shows 404 | Is page published? Check status in builder |
| DNS not resolving | Wait 24 hours, or contact registrar |
| Wrong domain shown | Verify `NEXT_PUBLIC_LANDING_PAGE_DOMAIN` in Vercel |
| Redirect not working | Check tracking URL is correct |

---

## 📝 Next Steps

1. **Add DNS Record** (Priority: HIGH)
2. **Add Vercel Environment Variable** (Priority: HIGH)
3. **Redeploy** (Priority: HIGH)
4. **Wait for DNS** (24-48 hours)
5. **Test** (Confirm working)

---

## 📞 Support

- **Landing Page Builder Guide**: See `LANDING_PAGE_BUILDER.md`
- **Subdomain Details**: See `SUBDOMAIN_SETUP_GUIDE.md`
- **Architecture**: See `SUBDOMAIN_ARCHITECTURE.md`

---

**Status**: Ready for DNS Configuration ✅

**Your landing page builder is fully functional. Just need DNS & Vercel env var! 🚀**
