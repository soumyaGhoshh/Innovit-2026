# Quick Debug Guide - Phase 2 Certificate Issue

## Current Issue
Email `rohan.24bai10613@vitbhopal.ac.in` is showing error: "Your team was not found in Phase 2 records"

## How to Debug

### Step 1: Check Browser Console
1. Open the website at **http://localhost:5173/**
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Try the email again: `rohan.24bai10613@vitbhopal.ac.in`

### Step 2: Look for Debug Messages
The console will show something like this:

```
🔍 Searching for team in Phase 2 CSVs:
  📧 User Email: rohan.24bai10613@vitbhopal.ac.in
  👤 User Name: [name from Supabase]
  👥 Team from Supabase: [team name from Supabase]
  👨‍💼 Leader Name: [leader name]
  🔤 Leader Name (cleaned): [cleaned leader name]

  🎯 Searching TH01 (20 teams)...
  🎯 Searching TH02 (14 teams)...
  🎯 Searching TH04 (X teams)...
  🎯 Searching TH05 (14 teams)...
```

### Step 3: Identify the Problem

#### Scenario A: Email Not in Supabase
```
Error: "Email not found in our database"
```
**Solution**: The email needs to be added to Supabase `id_card_users` table

#### Scenario B: Team Name Mismatch
```
🔍 Searching for team in Phase 2 CSVs:
  👥 Team from Supabase: "CloudNine Devs" ← This is different!
  
  ❌ NO MATCH FOUND in any theme
  💡 Team in Supabase: CloudNine Devs
```

**CSV has**: `CloudNine Devs`
**Supabase has**: `CloudNine` or `Cloud Nine Devs` or something different

**Solution**: Update Supabase team name to match CSV exactly

#### Scenario C: Leader Name Mismatch
```
  👨‍💼 Leader Name: John Doe
  🔤 Leader Name (cleaned): johndoe
```
But CSV has: `Rohan Malik`

**Solution**: Either:
1. User is not the team leader - enter the team leader's email
2. Team leader name in Supabase doesn't match CSV

### Step 4: Common Issues & Solutions

#### Issue 1: Email not in Supabase
**Problem**: `rohan.24bai10613@vitbhopal.ac.in` doesn't exist in `id_card_users` table

**Solution**:
```sql
INSERT INTO id_card_users (
  email_id, 
  name, 
  team, 
  team_position,
  user_type
) VALUES (
  'rohan.24bai10613@vitbhopal.ac.in',
  'Rohan Malik',
  'CloudNine Devs',
  'Leader',
  'participant'
);
```

#### Issue 2: Team Name Has Extra Spaces
**CSV has**: `CloudNine Devs` (notice the space after "Devs")
**Supabase has**: `CloudNine Devs` (extra space at end)

**Solution**: Use `.trim()` or update Supabase to remove extra spaces

#### Issue 3: Different Team Name Format
**CSV has**: `CloudNine Devs`
**Supabase has**: `cloudnine devs` (all lowercase)

**Solution**: The code should handle this with case-insensitive matching, but if not, update Supabase to match CSV

## Quick Test Commands

### Check if email exists in Supabase
```javascript
// Run in browser console
const { data, error } = await supabase
  .from('id_card_users')
  .select('*')
  .eq('email_id', 'rohan.24bai10613@vitbhopal.ac.in')
  .single();

console.log('Supabase data:', data);
```

### Check CSV data
Open browser console and type:
```javascript
// After entering email, check what was loaded
console.log('CSVresults:', results);
```

## Expected Output When Working

When everything works correctly, you should see:

```
🔍 Searching for team in Phase 2 CSVs:
  📧 User Email: rohan.24bai10613@vitbhopal.ac.in
  👤 User Name: Rohan Malik
  👥 Team from Supabase: CloudNine Devs
  👨‍💼 Leader Name: Rohan Malik
  🔤 Leader Name (cleaned): rohanmalik

  🎯 Searching TH01 (20 teams)...
  🎯 Searching TH02 (14 teams)...
  🎯 Searching TH04 (X teams)...
  🎯 Searching TH05 (14 teams)...
  ✅ MATCH FOUND in TH05!
  📋 CSV Team Name: CloudNine Devs
  👨‍💼 CSV Leader Name: Rohan Malik
  🏆 Shortlisted: Yes
```

Then you should see success message:
✅ "Verified! Your Phase 2 Qualified certificate for Blockchain & Cybersecurity is ready."

## Next Steps After Debugging

1. **Copy the console output**
2. **Share it with me** so I can see exactly what's happening
3. **We'll fix the specific issue** (likely just a Supabase data issue)

## Most Likely Issue

Based on the error, the most probable cause is:
1. ❌ Email `roh an.24bai10613@vitbhopal.ac.in` is **NOT** in the Supabase `id_card_users` table
2. ✅ Email IS in the CSV file for Phase 2

**Solution**: Add this user to Supabase first, then try again!

---

**After you check the console, let me know what you see!**
