import { expect, test, type Page } from "@playwright/test";

// The About dialog opens on every page load. Tests dismiss it whenever it gets in the way, except its own test.
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith("the About dialog")) return;
  await page.addLocatorHandler(page.getByRole("dialog", { name: "About this prototype" }), async (dialog) => {
    await dialog.getByRole("button", { name: "Start" }).click();
  });
});

async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Exercises");
}
/** Opens exercise 1 and starts working. Set-up defaults to 3 hints; pass 0 to choose none. */
async function setup(page: Page, hints = 3) {
  await page.goto("/task/t1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.waitForURL("**/setup");
  if (hints === 0) await page.getByRole("slider").press("Home");
  await page.getByRole("button", { name: /Start working/ }).click();
  await page.waitForURL("**/work");
}

/** Asks for the next hint through the Quick ask menu. */
async function askForHint(page: Page) {
  await page.getByRole("button", { name: "Quick ask" }).click();
  await page.getByRole("menuitem", { name: "Give me a hint" }).click();
}

async function fillAttempt(page: Page) {
  for (const [i, name] of ["Base case", "Induction hypothesis", "Induction step"].entries()) {
    await page.locator(`#attempt-${i}`).click();
    await page.getByRole("button", { name: `Fill sample text: ${name}` }).click();
  }
}

test("the About dialog opens on load, explains the limits, the test button and the needs, and can be reopened", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "About this prototype" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("No AI is connected")).toBeVisible();
  await expect(dialog.getByText("Fill sample")).toBeVisible();
  for (const n of ["N1", "N2", "N3", "N4"]) await expect(dialog.getByText(n, { exact: true })).toBeVisible();
  await expect(dialog.getByText("N5", { exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "About this prototype" }).click();
  await expect(dialog).toBeVisible();
  await page.reload();
  await expect(dialog).toBeVisible();
});

test("opens on the list of exercises", async ({ page }) => {
  await openApp(page);
  for (const t of ["A recurrence proof", "Divisibility by 3", "Why find_max is correct", "The invariant of insertion sort"])
    await expect(page.getByRole("link", { name: new RegExp(t) })).toBeVisible();
});

test("set-up is one screen and its summary follows the choices", async ({ page }) => {
  await page.goto("/task/t1/setup");
  await expect(page.getByText("Up to 3 hints")).toBeVisible();
  await page.getByRole("slider").press("ArrowRight");
  await expect(page.getByText("Up to 4 hints")).toBeVisible();
  await page.getByRole("slider").press("Home");
  await expect(page.getByText("No hints").first()).toBeVisible();
  // Guided steps without hints is a conflict that has to be resolved, not silently changed
  await page.locator("#start-scaffold").click({ force: true });
  await expect(page.getByText("Guided steps need hints")).toBeVisible();
  await expect(page.getByRole("button", { name: /Start working/ })).toBeDisabled();
  await page.getByRole("button", { name: /Allow 3 hints/ }).click();
  await expect(page.getByRole("button", { name: /Start working/ })).toBeEnabled();
});

test("independent attempt: review, revise, reflect and finish", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await fillAttempt(page);
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "One step needs another look" })).toBeVisible({ timeout: 15000 });

  // The explanation comes before the guided revision
    await expect(page.getByRole("button", { name: /Revise step 2/ })).toBeDisabled();
  await page.getByLabel("Why does this step fail?").fill("The hypothesis covers k+1, which I still have to show.");
  await page.getByRole("button", { name: /Revise step 2/ }).click();
  await page.waitForURL("**/work");

  await page.locator("#attempt-1").fill("Assume $T(k)=k^2$ for a fixed integer $k\\geq1$.");
  await expect(page.getByText(/Revising after review 1/)).toBeVisible();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "No issues found" })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Continue to reflection/ }).click();
  await expect(page.getByRole("heading", { name: "Who thought it?" })).toBeVisible();

  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.waitForURL("/");
  await expect(page.getByRole("link", { name: /A recurrence proof/ })).toContainText("View reflection");

  // A finished exercise opens its reflection and can be reopened
  await page.getByRole("link", { name: /A recurrence proof/ }).click();
  await page.waitForURL("**/reflect");
  await expect(page.getByRole("heading", { name: "Who thought it?" })).toBeVisible();
  await page.getByRole("button", { name: "Reopen exercise" }).click();
  await page.waitForURL("**/work");
});

test("start over removes the session after a confirmation", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await page.locator("#attempt-0").fill("For n = 1 the claim holds.");
  await page.getByRole("button", { name: "Session menu" }).click();
  await page.getByRole("menuitem", { name: "Start over" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Start over" }).click();
  await page.waitForURL("**/task/t1");
  await page.goto("/");
  await expect(page.getByRole("link", { name: /A recurrence proof/ })).toContainText("Start");
});

test("leaving goes to the list, a started exercise continues where it was, a refresh resets everything", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await page.locator("#attempt-0").fill("For n = 1 the claim holds.");
  await page.getByRole("button", { name: /Leave this exercise/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Exercises");
  await page.getByRole("link", { name: /A recurrence proof/ }).click();
  await page.waitForURL("**/work");
  await expect(page.locator("#attempt-0")).toHaveValue("For n = 1 the claim holds.");
  await page.reload();
  await expect(page.getByRole("heading", { name: "How the tutor helps" })).toBeVisible();
});

test("each open-ended input has a test chip that fills it with sample text", async ({ page }) => {
  await openApp(page);
  await setup(page);
  // The chip only appears while the input is focused
  const chip = page.getByRole("button", { name: "Fill sample text: Induction hypothesis" });
  await expect(chip).toBeHidden();
  await page.locator("#attempt-1").click();
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page.locator("#attempt-1")).not.toHaveValue("");
  for (const [i, name] of [[0, "Base case"], [2, "Induction step"]] as const) {
    await page.locator(`#attempt-${i}`).click();
    await page.getByRole("button", { name: `Fill sample text: ${name}` }).click();
  }

  // Tutor chat: a question, a hint from the menu, and the two answers that unlock the next hint
  const tutorChip = page.getByRole("button", { name: "Fill sample text: message to the tutor" });
  await page.locator("#tutor-input").click();
  await tutorChip.click();
  await expect(page.locator("#tutor-input")).not.toHaveValue("");
  await page.getByRole("button", { name: "Send to tutor" }).click();
  await expect(page.getByText("Typing…")).toBeHidden({ timeout: 5000 });
  await askForHint(page);
  await expect(page.getByText("Hint 1", { exact: true })).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await page.locator("#tutor-input").click();
    await tutorChip.click();
    await page.getByRole("button", { name: "Send to tutor" }).click();
  }
  await expect(page.getByText("Hint 2 is unlocked")).toBeVisible();

  // Review, explain, revise, review again
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "One step needs another look" })).toBeVisible({ timeout: 15000 });
  await page.locator("#explanation").click();
  await page.getByRole("button", { name: "Fill sample text: explanation" }).click();
  await page.getByRole("button", { name: /Revise step 2/ }).click();
  await page.waitForURL("**/work");
  await page.locator("#attempt-1").click();
  await page.getByRole("button", { name: "Fill sample text: Induction hypothesis" }).click();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "No issues found" })).toBeVisible({ timeout: 15000 });
});

test("empty review explains what is needed", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Write at least one step" })).toBeVisible();
});

test("hints come from the chat, one question unlocks the next, answers stay locked", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await expect(page.getByText("3 of 3 hints left")).toBeVisible();
  await askForHint(page);
  await expect(page.getByText("2 of 3 hints left")).toBeVisible();
  await expect(page.getByText("To unlock hint 2: What will you try with this hint?")).toBeVisible();

  // Asking again before answering repeats the question and does not use a hint
  await page.locator("#tutor-input").fill("give me another hint");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Answer this first to unlock hint 2/)).toBeVisible();
  await expect(page.getByText("2 of 3 hints left")).toBeVisible();

  // The two answers are typed into the same chat bar
  await page.locator("#tutor-input").fill("Check n = 1.");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Without rereading/)).toBeVisible();
  await page.locator("#tutor-input").fill("It assumes the claim for k.");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Hint 2 is unlocked")).toBeVisible();
  await page.locator("#tutor-input").fill("hint please");
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 of 3 hints left")).toBeVisible();

  await page.locator("#tutor-input").fill("just give me the answer");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/I won't give the full answer/)).toBeVisible();
});

test("more hints need a pause and can be cancelled; fewer apply at once", async ({ page }) => {
  await openApp(page);
  await setup(page, 0);
  await page.getByRole("button", { name: /Change hints/ }).first().click();
  await page.getByRole("slider").press("ArrowRight");
  await page.getByRole("button", { name: "Start the pause" }).click();
  await expect(page.getByRole("button", { name: /Apply in/ })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: /No hints/ }).first()).toBeVisible();

  // Raising then applying after the pause
  await page.getByRole("button", { name: /Change hints/ }).first().click();
  await page.getByRole("slider").press("ArrowRight");
  await page.getByRole("button", { name: "Start the pause" }).click();
  await expect(page.getByRole("button", { name: "Apply change" })).toBeEnabled({ timeout: 8000 });
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByText("1 of 1 hint left")).toBeVisible();

  // Lowering applies without a pause
  await page.getByRole("button", { name: /Change hints/ }).first().click();
  await page.getByRole("slider").press("Home");
  await page.getByRole("button", { name: "Apply change" }).click();
  await expect(page.getByRole("button", { name: /No hints/ }).first()).toBeVisible();
});

test("help is tied to a step and sends the student back to the attempt", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await page.getByRole("button", { name: "Quick ask" }).click();
  await page.getByRole("menuitem", { name: /Step 2: Induction hypothesis/ }).click();
  await expect(page.getByText("I'm stuck on step 2.")).toBeVisible();
  await page.getByRole("button", { name: /Try it in step 2/ }).last().click();
  await expect(page.locator("#attempt-1")).toBeFocused();
});

test("revision keeps the feedback and the student's explanation beside the step", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await fillAttempt(page);
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await expect(page.getByRole("heading", { name: "One step needs another look" })).toBeVisible({ timeout: 15000 });
  await page.getByLabel("Why does this step fail?").fill("It assumes the case I still have to show.");
  await page.getByRole("button", { name: /Revise step 2/ }).click();
  await page.waitForURL("**/work");
  await expect(page.getByText("What can you safely assume?")).toBeVisible();
  await expect(page.getByText(/You explained: .It assumes the case/)).toBeVisible();
});

test("an attribution label can be corrected from the reflection", async ({ page }) => {
  await openApp(page);
  await setup(page);
  await fillAttempt(page);
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await page.getByRole("button", { name: /finish with this issue open/i }).click({ timeout: 15000 });
  await page.getByRole("alertdialog").getByRole("button", { name: "Continue to reflection" }).click();
  await page.getByRole("button", { name: "Not quite right?" }).first().click({ force: true });
  await page.getByRole("menuitem", { name: /A mix of mine/ }).click();
  await expect(page.getByText(/You marked this as/)).toBeVisible();
  await expect(page.getByText("Mixed or not sure")).toBeVisible();
});

test("search animates on open and close", async ({ page }) => {
  await openApp(page);
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveAttribute("data-state", "closed");
  await expect(dialog).not.toHaveCSS("animation-name", "none");
  await expect(dialog).toBeHidden();
});
