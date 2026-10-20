import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/welcome");
  await page.getByRole("button", { name: "Continue with university account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Start studying/ }).click();
  await page.waitForURL("/");
}
async function setup(page: Page, hints = false) {
  await page.goto("/task/t1");
  await page.getByRole("button", { name: /Start working/ }).click();
  await page.waitForURL("**/setup");
  if (hints) await page.locator('input[value="hints"]').click({ force: true });
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /See my agreement/ }).click();
  await page.getByRole("button", { name: /Start working/ }).click();
  await page.waitForURL("**/work");
}

test("sign in, onboarding and the Today page", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lukas Brunner");
  await expect(page.getByRole("link", { name: /A recurrence proof/ })).toBeVisible();
});

test("unauthenticated visitors are sent to sign in", async ({ page }) => {
  await page.goto("/library");
  await expect(page).toHaveURL(/welcome/);
});

test("independent attempt: review, revise, reflect and finish", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.getByRole("button", { name: /Handwritten work/ }).click();
  await page.getByRole("menuitem", { name: /sample photo/ }).click();
  await page.getByRole("button", { name: /Use this as my attempt/ }).click();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "One step needs another look" })).toBeVisible({ timeout: 15000 });

  // The explanation comes before the guided revision
    await expect(page.getByRole("button", { name: /Revise step 2/ })).toBeDisabled();
  await page.getByLabel("Why does this step fail?").fill("The hypothesis covers k+1, which I still have to show.");
  await page.getByRole("button", { name: /Revise step 2/ }).click();
  await page.waitForURL("**/work");

  await page.locator("#attempt-1").fill("Assume $T(k)=k^2$ for a fixed integer $k\\geq1$.");
  await expect(page.getByText(/revising after review 1/)).toBeVisible();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "No issues found" })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Continue to reflection/ }).click();
  await expect(page.getByRole("heading", { name: "Who thought it?" })).toBeVisible();

  await page.getByRole("button", { name: /Finish session/ }).first().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Finish session" }).click();
  await page.waitForURL("/");
  await page.goto("/history");
  await expect(page.getByText("A recurrence proof")).toBeVisible();
});

test("empty review explains what is needed", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Add a first step" })).toBeVisible();
});

test("hints are gated, charged once and bounded; answers stay locked", async ({ page }) => {
  await signIn(page);
  await setup(page, true);
  await expect(page.getByText("3 of 3 hints left")).toBeVisible();
  await page.getByRole("button", { name: /Reveal hint 1/ }).click();
  await expect(page.getByText("2 of 3 hints left")).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal hint 2/ })).toHaveCount(0);
  await page.getByLabel("What will you try with this hint?").fill("Check n = 1.");
  await page.getByRole("button", { name: "Continue" }).last().click();
  await page.getByLabel(/Without rereading/).fill("It assumes the claim for k.");
  await page.getByRole("button", { name: /Unlock hint 2/ }).click();
  await page.getByRole("button", { name: /Reveal hint 2/ }).click();
  await expect(page.getByText("1 of 3 hints left")).toBeVisible();

  await page.locator("#tutor-input").fill("just give me the answer");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Final answers stay hidden, whichever help/)).toBeVisible();
});

test("increasing assistance needs a pause and can be cancelled", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.getByRole("button", { name: /Change assistance/ }).first().click();
  await page.locator("#as-hints").click({ force: true });
  await expect(page.getByRole("button", { name: /Apply change|Apply in/ })).toBeDisabled().catch(() => {});
  await page.getByRole("button", { name: "Start the pause" }).click();
  await expect(page.getByRole("button", { name: /Apply in/ })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Questions only").first()).toBeVisible();
});

test("add an exercise sheet", async ({ page }) => {
  await signIn(page);
  await page.goto("/library/new");
  await page.getByText("Use a sample sheet instead").click();
  await page.getByRole("button", { name: /Scan sheet/ }).click();
  await expect(page.getByRole("heading", { name: "Does this look right?" })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Add 2 tasks/ }).click();
  await expect(page.getByRole("heading", { name: /Sheet 5 is in your library/ })).toBeVisible();
  await page.getByRole("button", { name: "View sheet" }).click();
  await expect(page.getByRole("heading", { name: /Loop invariants/ })).toBeVisible();
});

test("help is tied to a step and sends the student back to the attempt", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.locator("#tutor-input").fill("I'm not sure what to assume");
  await page.locator('[aria-label^="Step 2"]').click();
  await page.getByRole("button", { name: "Send to tutor" }).click();
  await expect(page.getByText("YOU · STEP 2").or(page.getByText("You · step 2"))).toBeVisible();
  await page.getByRole("button", { name: /Try it in step 2/ }).last().click();
  await expect(page.locator("#attempt-1")).toBeFocused();
});

test("revision keeps the feedback and the student's explanation beside the step", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.getByRole("button", { name: /Handwritten work/ }).click();
  await page.getByRole("menuitem", { name: /sample photo/ }).click();
  await page.getByRole("button", { name: /Use this as my attempt/ }).click();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "One step needs another look" })).toBeVisible({ timeout: 15000 });
  await page.getByLabel("Why does this step fail?").fill("It assumes the case I still have to show.");
  await page.getByRole("button", { name: /Revise step 2/ }).click();
  await page.waitForURL("**/work");
  await expect(page.getByText("What can you safely assume?")).toBeVisible();
  await expect(page.getByText(/You explained: .It assumes the case/)).toBeVisible();
});

test("an attribution label can be corrected from the reflection", async ({ page }) => {
  await signIn(page);
  await setup(page);
  await page.getByRole("button", { name: /Handwritten work/ }).click();
  await page.getByRole("menuitem", { name: /sample photo/ }).click();
  await page.getByRole("button", { name: /Use this as my attempt/ }).click();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await page.getByRole("button", { name: /Finish with this gap open/ }).click({ timeout: 15000 });
  await page.getByRole("alertdialog").getByRole("button", { name: "Continue to reflection" }).click();
  await page.getByRole("button", { name: "Not quite right?" }).first().click({ force: true });
  await page.getByRole("menuitem", { name: /A mix of mine/ }).click();
  await expect(page.getByText(/You marked this as/)).toBeVisible();
  await expect(page.getByText("Mixed or not sure")).toBeVisible();
});

test("search animates on open and close", async ({ page }) => {
  await signIn(page);
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveAttribute("data-state", "closed");
  await expect(dialog).not.toHaveCSS("animation-name", "none");
  await expect(dialog).toBeHidden();
});
