import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Test user credentials from user
const TEST_STUDENT_EMAIL = 'pulkit.talks@gmail.com';
const TEST_STUDENT_PASSWORD = 'Peacee@2025';
const TEST_COUNSELLOR_INITIALS = 'TC';

test.describe('Student Booking Flow - Fix Verification', () => {
  let sessionId: string;
  let studentUid: string;
  let slotDocId: string;
  const apiKey = 'AIzaSyDdnknvxr5YZYXq8QyCR9mRb_sLeM54I3g';
  const projectId = 'unmuted-758f5';

  test.beforeAll(async ({ request }) => {
    console.log(`Setting up test with student: ${TEST_STUDENT_EMAIL}`);

    const createStudentResponse = await request.post(
      `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        data: {
          email: TEST_STUDENT_EMAIL,
          password: TEST_STUDENT_PASSWORD,
          returnSecureToken: true,
        },
      }
    );
    const studentData = await createStudentResponse.json();
    studentUid = studentData.localId;
    const idToken = studentData.idToken;

    if (idToken) {
        await request.post(
            `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
            {
                data: {
                    idToken: idToken,
                    emailVerified: true,
                }
            }
        );
    }

    const counsellorUid = 'test-counsellor-uid';
    await request.patch(
      `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/Counsellors/${counsellorUid}`,
      {
        data: {
          fields: {
            email: { stringValue: 'counsellor@example.com' },
            initials: { stringValue: TEST_COUNSELLOR_INITIALS },
            meetingLink: { stringValue: 'https://meet.google.com/test-meeting' },
            username: { stringValue: 'Test Counsellor' },
            role: { stringValue: 'COUNSELOR' },
            uid: { stringValue: counsellorUid }
          },
        },
      }
    );

    sessionId = `video-session-${uuidv4()}`;
    await request.patch(
      `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/VideoCallSession/${sessionId}`,
      {
        data: {
          fields: {
            studentId: { stringValue: studentUid || 'unknown' },
            status: { stringValue: 'pending' },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        },
      }
    );

    const now = new Date();
    const fifteenMinInterval = 15 * 60 * 1000;
    const futureTimeMillis = Math.ceil((now.getTime() + 20 * 60 * 1000) / fifteenMinInterval) * fifteenMinInterval;
    const futureDate = new Date(futureTimeMillis);

    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = futureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    slotDocId = `globalsession-${uuidv4()}`;
    await request.patch(
      `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/GlobalSessions/${slotDocId}`,
      {
        data: {
          fields: {
            counsellorId: { stringValue: counsellorUid },
            counsellorInitials: { stringValue: TEST_COUNSELLOR_INITIALS },
            counsellorUsername: { stringValue: 'Test Counsellor' },
            counsellorEmail: { stringValue: 'counsellor@example.com' },
            date: { stringValue: dateStr },
            time: { stringValue: timeStr },
            isBooked: { booleanValue: false },
            bookedBy: { stringValue: '' },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        },
      }
    );
    console.log(`Setup complete. Slot: ${timeStr} for ${dateStr}`);
  });

  test('slot should remain available until payment is verified', async ({ page }) => {
    test.slow(); // Increases timeout for this test

    page.on('dialog', async dialog => {
      console.log(`Dialog: ${dialog.message()}`);
      await dialog.accept();
    });

    await page.goto('/student/login');
    await page.fill('input[placeholder="name@email.com"]', TEST_STUDENT_EMAIL);
    await page.fill('input[placeholder="••••••••"]', TEST_STUDENT_PASSWORD);
    await page.click('button:has-text("Log In")');
    await page.waitForURL('/student/dashboard');

    await page.goto(`/student/calendar?sessionId=${sessionId}`);
    await page.waitForURL(/\/student\/calendar\?sessionId=.+/);
    
    console.log('On calendar page. Waiting for stability...');
    await page.waitForTimeout(2000); // Give React some time to settle

    const dateButton = page.locator('button.w-20.h-28').first();
    await dateButton.click();

    console.log('Waiting for slot...');
    const slotButtonSelector = `button:has-text("${TEST_COUNSELLOR_INITIALS}")`;
    await page.waitForSelector(slotButtonSelector, { state: 'visible' });
    await page.click(slotButtonSelector);
    
    await page.click('button:has-text("Confirm Appointment")');

    await page.waitForURL(/\/student\/payment\?sessionId=.+/);
    console.log('On payment page. Navigating back to calendar...');

    await page.goto(`/student/calendar?sessionId=${sessionId}`);
    await page.waitForURL(/\/student\/calendar\?sessionId=.+/);
    await page.waitForTimeout(2000);

    await page.locator('button.w-20.h-28').first().click();

    console.log('Checking if slot is still there...');
    await page.waitForSelector(slotButtonSelector, { state: 'visible' });
    
    const slotCount = await page.locator(slotButtonSelector).count();
    console.log(`Final slot count (should be >= 1): ${slotCount}`);
    expect(slotCount).toBeGreaterThan(0); 
  });
});
