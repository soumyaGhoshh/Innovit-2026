# Quick Testing Guide - Phase 2 Certificates

## Test the Implementation

### 1. Access the Application
The dev server is running at: **http://localhost:5173/**

### 2. Navigate to Certificates Page
Click on the "Certificates" or "Download Certificate" button in the navigation

### 3. Test Phase 2 Tab

#### Step-by-Step Test
1. Click on the **"Phase 2"** tab
2. You should see a verification form with:
   - Email address input field
   - "Verify & Preview" button

#### Test with Sample Data
Based on the CSV files, here are some test emails you can try:

**Theme 1 - Open Innovation (TH01)**
- `nagane.25bce10261@vitbhopal.ac.in` - Team: TaskForce404 (Qualified - Rank 1)
- `tanvi.25bai10025@vitbhopal.ac.in` - Team: BYTE BRIGADE (Qualified - Rank 2)
- `kushagra.25bai11055@vitbhopal.ac.in` - Team: ByteWave (Participated - Rank 10)

**Theme 2 - Heritage & Culture (TH02)**
- `poorvajaa.25mei10059@vitbhopal.ac.in` - Team: Digital Roots (Qualified - Rank 1)
- `avani.25bce10044@vitbhopal.ac.in` - Team: HackHers (Qualified - Rank 2)
- `shital.24bce11286@vitbhopal.ac.in` - Team: CodeNova (Participated - Rank 8)

**Theme 4 - Agriculture (TH04)**
- Use emails from th04.csv

**Theme 5 - Blockchain & Cybersecurity (TH05)**
- `rohan.24bai10613@vitbhopal.ac.in` - Team: CloudNine Devs (Qualified - Rank 1)
- `pranav.24bsa10068@vitbhopal.ac.in` - Team: DeepTrace (Qualified - Rank 2)
- `avika.24bce10772@vitbhopal.ac.in` - Team: InnoVentures (Participated - Rank 7)

### 4. Expected Behavior

#### For Qualified Teams (Shortlisted = "YES")
1. Enter email and click "Verify & Preview"
2. Should show:
   - ✅ Name field (auto-filled, read-only)
   - ✅ Team field (auto-filled, read-only)
   - ✅ Badge: "Certificate Type: Phase 2 Qualified ✨"
3. Preview section should show:
   - ✅ PDF preview of "PHASE 2 QUALIFIED .pdf" with name added
   - ✅ QR code
   - ✅ Certificate ID (starting with P2Q-)
   - ✅ Download button
   - ✅ Share button

#### For Participated Teams (Shortlisted = "")
1. Enter email and click "Verify & Preview"
2. Should show:
   - ✅ Name field (auto-filled, read-only)
   - ✅ Team field (auto-filled, read-only)
   - ✅ Badge: "Certificate Type: Phase 2 Participated 🎉"
3. Preview section should show:
   - ✅ PDF preview of "PHASE 2 PARTICIPATED.pdf" with name added
   - ✅ QR code
   - ✅ Certificate ID (starting with P2P-)
   - ✅ Download button
   - ✅ Share button

### 5. Test Download Functionality
1. After verification, click "Download High-Res PDF"
2. Certificate should download with filename:
   - Qualified: `Phase2_Qualified_[Name].pdf`
   - Participated: `Phase2_Participated_[Name].pdf`
3. Open downloaded PDF and verify:
   - ✅ Name is centered on certificate
   - ✅ Certificate ID is at bottom
   - ✅ QR code is visible at bottom

### 6. Test Share Functionality
1. Click "Share Certificate" button
2. Modal should open showing:
   - ✅ QR code (larger)
   - ✅ Certificate ID
   - ✅ Verification link
   - ✅ "Copy Link" button
   - ✅ "Open Link" button
   - ✅ Copy Certificate ID button

### 7. Test Error Cases

#### Invalid Email
```
Input: "notregistered@example.com"
Expected: Error toast "Email not found in our database"
```

#### Empty Email
```
Input: (leave empty)
Expected: Error toast "Please enter your email address"
```

#### Team Not in Phase 2
```
Input: Email of someone who registered but didn't participate in Phase 2
Expected: Error toast "Your team was not found in Phase 2 records"
```

### 8. Test Tab Switching
1. Switch between Phase 1, Phase 2, and Officials tabs
2. Verify:
   - ✅ Form resets when switching tabs
   - ✅ No errors in console
   - ✅ Each tab shows appropriate content

### 9. Mobile Testing (Optional)
1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test same functionality on mobile
4. Verify:
   - ✅ Responsive layout
   - ✅ Buttons are tappable
   - ✅ PDF preview scales correctly
   - ✅ Forms are usable

## Quick Verification Checklist

- [ ] Phase 2 tab is visible and clickable
- [ ] Email input field works
- [ ] Verify button works
- [ ] Preview shows correct certificate template
- [ ] Certificate type badge shows correctly
- [ ] Download button works
- [ ] Share button opens modal
- [ ] QR code generates
- [ ] Certificate ID is unique and correct format
- [ ] No console errors
- [ ] Mobile responsive

## Known Limitations

1. **Email must be in Supabase** - Users MUST have registered through the ID card system
2. **Team must be in CSV** - Team name in Supabase must match CSV exactly (or close enough for fuzzy matching)
3. **No manual certificate generation** - Cannot manually create certificates without email verification

## Troubleshooting Quick Fixes

### "Email not found"
→ Check if email exists in Supabase `id_card_users` table

### "Team not found in Phase 2"
→ Check if team name in Supabase matches CSV (check for typos, extra spaces)

### PDF preview not loading
→ Open browser console, check for 404 errors on PDF files

### Certificate download fails
→ Check browser console for PDF generation errors

### QR code missing
→ Verify certificate_hash_id was generated and saved

## Success Criteria

✅ **All tests pass** → Ready for production
⚠️ **Some tests fail** → Review error messages and fix issues
❌ **Major failures** → Check documentation and implementation

---

**Test Date**: ___________
**Tester**: ___________
**Result**: ⬜ Pass ⬜ Fail ⬜ Partial
**Notes**: ___________________________________________
