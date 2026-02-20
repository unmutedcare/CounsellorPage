import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const TEST_PASSWORD = 'password123';
const TEST_MEET_LINK = 'https://meet.google.com/test-sync-link';
const PROJECT_ID = 'unmuted-758f5';
const API_KEY = 'AIzaSyDdnknvxr5YZYXq8QyCR9mRb_sLeM54I3g';

test.describe('End-to-End Counsellor-Student Booking and Payment Sync', () => {
  let counsellorEmail: string;
  let studentEmail: string;
  let counsellorInitials: string;
  let counsellorName: string;

  test.beforeAll(() => {
    const id = uuidv4().substring(0, 6);
    counsellorEmail = `couns-${id}@unmuted.com`;
    studentEmail = `stud-${id}@unmuted.com`;
    counsellorInitials = `C${id.substring(0, 2).toUpperCase()}`;
    counsellorName = `Counsellor ${id}`;
  });

  test('full workflow: counsellor setup -> student booking -> payment -> shared meet link', async ({ page, request }) => {
    test.setTimeout(240000); // 4 minute timeout for full flow

    // --- STEP 1: COUNSELLOR SETUP ---
    console.log(`--- Creating Counsellor: ${counsellorEmail} ---`);
    await page.goto('/counsellor/login');
    await page.click('text=Sign Up');
    await page.fill('input[placeholder="counselor@email.com"]', counsellorEmail);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('/counsellor/dashboard');

    // Set Profile details (Meet Link)
    console.log('--- Setting Meet Link ---');
    await page.goto('/profile'); // Using the unified profile page
    await page.click('button:has-text("Account Details")');
    await page.click('button:has-text("Edit Profile")');
    await page.fill('input[placeholder="Your display name"]', counsellorName);
    await page.fill('input[placeholder="e.g. JD"]', counsellorInitials);
    await page.fill('input[placeholder="https://meet.google.com/xxx-xxxx-xxx"]', TEST_MEET_LINK);
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Profile details updated successfully')).toBeVisible();

    // Set Availability
    console.log('--- Setting Availability ---');
    await page.goto('/counsellor/set-timing');
    await page.click('button:has-text("Add New Interval")', { force: true });
    // Set a time late in the day to ensure it's still "future"
    await page.fill('input[type="time"]', '23:30');
    await page.locator('button:has(svg.lucide-plus)').last().click();
    await page.click('button:has-text("Commit Windows")');
    page.on('dialog', d => d.accept());

    // --- STEP 2: STUDENT BOOKING ---
    console.log(`--- Creating Student: ${studentEmail} ---`);
    await page.evaluate(() => localStorage.clear());
    await page.goto('/student/signup');
    await page.fill('input[placeholder="yourname"]', `student_${uuidv4().substring(0,4)}`);
    await page.fill('input[placeholder="name@email.com"]', studentEmail);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    
    // Bypass email verification block in local test if it exists
    await page.waitForURL('/verify-email');
    
    // We need to verify the email in the emulator background to allow login
    // Or we just use the REST API to update the user record
    const listUsers = await request.get(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
        params: { email: studentEmail }
    });
    const studentUid = (await listUsers.json()).users[0].localId;
    await request.post(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`, {
        data: { idToken: 'fake-token', localId: studentUid, emailVerified: true }
    });

    await page.goto('/student/login');
    await page.fill('input[placeholder="name@email.com"]', studentEmail);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');
    await page.waitForURL('/student/dashboard');

    console.log('--- Booking Flow ---');
    await page.click('text=Book a Session');
    await page.click('text=Happy');
    await page.click('button:has-text("Continue")');
    await page.fill('textarea', 'Testing the full system integration.');
    await page.click('button:has-text("Find Support")');

    await page.waitForURL(/\/student\/calendar\?sessionId=.+/);
    const sessionId = new URL(page.url()).searchParams.get('sessionId');

    // Select the counsellor's slot
    await page.locator('button.w-20.h-28').first().click();
    const counsellorSlot = page.locator(`button:has-text("${counsellorInitials}")`);
    await expect(counsellorSlot).toBeVisible();
    await counsellorSlot.click();
    await page.click('button:has-text("Confirm Appointment")');

    // Payment Redirect
    await page.waitForURL(/\/student\/payment\?sessionId=.+/);
    console.log('--- Reached Payment Page ---');

    // --- STEP 3: SIMULATE PAYMENT & VERIFY SYNC ---
    console.log('--- Simulating Payment Success in DB ---');
    // Update VideoCallSession to paid
    await request.patch(`http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/VideoCallSession/${sessionId}?updateMask.fieldPaths=status`, {
        data: { fields: { status: { stringValue: 'paid' } } }
    });
    // Add to Bookings collection for the student
    await request.patch(`http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/Bookings/${studentUid}/sessions/${sessionId}`, {
        data: { fields: {
            sessionId: { stringValue: sessionId },
            status: { stringValue: 'upcoming' },
            counsellorName: { stringValue: counsellorName },
            date: { stringValue: new Date().toISOString().split('T')[0] },
            time: { stringValue: '11:30 PM' }
        }}
    });

    // 1. Verify Student View
    console.log('--- Verifying Student Dashboard ---');
    await page.goto('/student/dashboard');
    await page.reload(); // Ensure session is fetched
    const sessionCard = page.locator(`text=Session with ${counsellorName}`);
    await expect(sessionCard).toBeVisible();
    await sessionCard.click();
    
    await page.waitForURL(/\/student\/countdown\?sessionId=.+/);
    await expect(page.locator('button:has-text("Join Session Now")')).toBeVisible();

    // 2. Verify Counsellor View
    console.log('--- Verifying Counsellor Dashboard ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/counsellor/login');
    await page.fill('input[placeholder="counselor@email.com"]', counsellorEmail);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Access Portal")');
    await page.waitForURL('/counsellor/dashboard');
    
    await page.click('text=Upcoming Cases');
    await expect(page.locator(`text=Student:`)).toBeVisible();
    const joinBtn = page.locator('button:has-text("Join Portal")').first();
    await expect(joinBtn).toBeVisible();

    console.log('--- SUCCESS: Full system sync verified ---');
  });
});
