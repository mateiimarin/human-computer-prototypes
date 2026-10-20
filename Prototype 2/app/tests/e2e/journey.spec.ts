import { expect, test, type Page } from '@playwright/test'

async function startSession(page: Page, topic: RegExp | null, exercise: RegExp) {
  await page.goto('/study')
  if (topic) await page.getByRole('button', { name: topic }).click()
  await page.getByRole('radio', { name: exercise }).click()
  await page.getByRole('button', { name: 'Start with the baseline' }).click()
  await page.getByRole('button', { name: 'Start new session' }).click({ timeout: 1500 }).catch(() => {})
  await expect(page).toHaveURL(/pre-quiz/)
}

async function answerAll(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await expect(page.getByText(`Question ${i + 1} of ${count}`)).toBeVisible()
    await page.getByRole('radio').first().click()
    await page.getByRole('button', { name: /^(Next|Review answers)/ }).click()
    await page.waitForTimeout(450) // let the slide transition finish
  }
}

test('core session: baseline, work, explain, post-quiz, summary', async ({ page }) => {
  await startSession(page, null, /Maximum subarray/)
  await answerAll(page, 3)
  await page.getByRole('button', { name: 'Save baseline' }).click()

  // Saving the baseline goes straight to the choice of how to work; there is no extra screen in between.
  await expect(page.getByRole('heading', { name: 'How do you want to work on this?' })).toBeVisible()
  await expect(page.getByText('Baseline saved')).toBeVisible()
  await page.getByRole('button', { name: /Work on it here/ }).click()
  await expect(page).toHaveURL(/work/)

  await page.getByRole('button', { name: 'A hint' }).click()
  await expect(page.getByText('Hint 1 of 3')).toBeVisible()
  await page.getByRole('button', { name: 'Check my understanding' }).click()
  await page.getByRole('button', { name: 'Start the check' }).click()
  await expect(page.getByText('Independent check')).toBeVisible()

  await page.keyboard.press('Control+k')
  await page.getByRole('option', { name: 'A complete explanation' }).click()
  await page.getByRole('button', { name: 'Submit explanation' }).click()
  await expect(page.getByText('What you covered')).toBeVisible()
  await page.getByRole('button', { name: 'Continue to the post-quiz' }).click()

  await answerAll(page, 5)
  await page.getByRole('button', { name: /Submit and see my summary/ }).click()
  await expect(page.getByText(/You demonstrated \d of 3 points/)).toBeVisible()
  await expect(page.getByText('Before and after')).toBeVisible()
})

test('a partial explanation names the gap and points to an earlier occurrence', async ({ page }) => {
  await startSession(page, null, /Maximum subarray/)
  await page.getByRole('button', { name: 'Skip the baseline' }).click()
  await page.getByRole('button', { name: 'Skip baseline' }).click()
  await page.getByRole('button', { name: /I’ve already done it/ }).click()
  await page.getByRole('button', { name: 'Continue to the check' }).click()
  await page.keyboard.press('Control+k')
  await page.getByRole('option', { name: 'A partial explanation' }).click()
  await page.getByRole('button', { name: 'Submit explanation' }).click()
  await expect(page.getByText('Gap · Why discarding is safe')).toBeVisible()
  // The seeded workspace has an earlier gap on loop invariants: the same kind of mistake.
  await expect(page.getByText('This has come up before.')).toBeVisible()
  await page.getByRole('button', { name: 'See that evidence' }).click()
  await expect(page.getByRole('heading', { name: 'Loop invariant' })).toBeVisible()
})

test('skipping the post-quiz leaves it unverified in the summary', async ({ page }) => {
  await startSession(page, /Searching and invariants/, /Binary search/)
  await page.getByRole('button', { name: 'Skip the baseline' }).click()
  await page.getByRole('button', { name: 'Skip baseline' }).click()
  await page.getByRole('button', { name: /I’ve already done it/ }).click()
  await page.getByRole('button', { name: 'Continue to the check' }).click()
  await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip this check' }).click()
  await page.getByRole('button', { name: 'Skip this check' }).last().click()
  await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip this check' }).click()
  await page.getByRole('button', { name: /Skip and see summary/ }).click()
  await expect(page.getByText('Nothing was verified independently this time.')).toBeVisible()
  await expect(page.getByText('No baseline').first()).toBeVisible()
  await expect(page.getByText('Return to the check you skipped.')).toBeVisible()
})

test('“Do this later” keeps the check as postponed, not as evidence', async ({ page }) => {
  await startSession(page, /Searching and invariants/, /Binary search/)
  await page.getByRole('button', { name: 'Skip the baseline' }).click()
  await page.getByRole('button', { name: 'Do this later' }).click()
  await page.getByRole('button', { name: /I’ve already done it/ }).click()
  await page.getByRole('button', { name: 'Continue to the check' }).click()
  await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip this check' }).click()
  await page.getByRole('button', { name: 'Do this later' }).click()
  await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip this check' }).click()
  await page.getByRole('button', { name: 'Do this later' }).click()
  await expect(page.getByText('Nothing was verified independently this time.')).toBeVisible()
  await expect(page.getByText('Pick up the check you postponed.')).toBeVisible()
  await expect(page.getByText('Postponed').first()).toBeVisible()
  // Picking it up again returns to the explanation, with the postponement cleared.
  await page.getByRole('button', { name: 'Do it now' }).click()
  await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
})

test('references during a check make it assisted and keep the draft', async ({ page }) => {
  await startSession(page, null, /Maximum subarray/)
  await page.getByRole('button', { name: 'Skip the baseline' }).click()
  await page.getByRole('button', { name: 'Skip baseline' }).click()
  await page.getByRole('button', { name: /I’ve already done it/ }).click()
  await page.getByRole('button', { name: 'Continue to the check' }).click()
  await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
  await page.getByLabel('Your explanation').fill('Each position keeps the best sum ending there and either extends or starts fresh.')
  await page.getByRole('button', { name: 'Show references' }).click()
  await page.getByRole('button', { name: 'Open references' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByText('This check no longer counts as independent evidence.')).toBeVisible()
  await expect(page.getByLabel('Your explanation')).toHaveValue(/best sum ending there/)
})

test('a concept point can be practised on its own', async ({ page }) => {
  await page.goto('/concepts/search')
  await page.getByRole('button', { name: 'Practise this point' }).first().click()
  await expect(page.getByRole('heading', { name: 'Loop invariant', level: 1 })).toBeVisible()
  await expect(page.getByText(/Question 1 of [2-4]/)).toBeVisible()
  const total = Number((await page.getByText(/Question 1 of \d/).innerText()).match(/of (\d)/)![1])
  await answerAll(page, total)
  await page.getByRole('button', { name: 'Submit review' }).click()
  await page.getByRole('button', { name: 'See what changed' }).click()
  await expect(page.getByText('Evidence updated')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back to the concept' })).toBeVisible()
})

test('exam plan changes the queue', async ({ page }) => {
  await page.goto('/review?tab=exam')
  await expect(page.locator('main ol > li')).toHaveCount(5)
  const before = 5
  await page.getByRole('switch', { name: 'Include Searching and invariants' }).click()
  await expect.poll(() => page.locator('main ol > li').count()).toBeLessThan(before)
})

test('the collapsed sidebar keeps every control whole and inside the rail', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-sidebar="trigger"]').first().click()
  await page.waitForTimeout(400)
  for (const name of ['Overview', 'Study', 'Concepts', 'Review', 'Account menu']) {
    const box = await page.getByRole(name === 'Account menu' ? 'button' : 'link', { name: new RegExp(name) }).first().boundingBox()
    expect(box, name).not.toBeNull()
    expect(box!.x, `${name} starts inside the rail`).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width, `${name} ends inside the rail`).toBeLessThanOrEqual(56)
    expect(box!.width, `${name} is a comfortable target`).toBeGreaterThanOrEqual(36)
  }
  // Nothing spills out of the rail (its own drag handle excepted).
  const spill = await page.evaluate(() => {
    const rail = document.querySelector('[data-slot="sidebar"] [data-sidebar="sidebar"]')!.getBoundingClientRect()
    return [...document.querySelectorAll('[data-sidebar="sidebar"] *:not([data-sidebar="rail"])')].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.right > rail.right + 1
    }).length
  })
  expect(spill).toBe(0)
})

test('a refresh without a session lands on setup, not a broken screen', async ({ page }) => {
  await page.goto('/study')
  await expect(page.getByRole('heading', { name: 'Study' })).toBeVisible()
  await page.evaluate(() => { const k = 'prove-it:workspace:v1'; const w = JSON.parse(localStorage.getItem(k)!); w.active = null; localStorage.setItem(k, JSON.stringify(w)) })
  await page.goto('/session/explain')
  await expect(page).toHaveURL(/study/)
  await expect(page.getByText('There’s no open session right now')).toBeVisible()
})
