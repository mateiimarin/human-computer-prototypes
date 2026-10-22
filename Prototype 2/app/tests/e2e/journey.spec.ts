import { expect, test, type Page } from '@playwright/test'

/** The About popup opens on every load. Tests dismiss it, except the one that is about it. */
test.beforeEach(async ({ page }) => {
  await page.addLocatorHandler(page.getByRole('dialog', { name: 'About this prototype' }), async (dialog) => {
    await dialog.getByRole('button', { name: 'Start' }).click()
  })
})

const exercise = (title: string) => `Start: ${title}`

/** For the few tests that open the popup on purpose. */
const allowAbout = (page: Page) => page.removeLocatorHandler(page.getByRole('dialog', { name: 'About this prototype' }))

async function startExercise(page: Page, title: string) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
  await page.getByRole('button', { name: exercise(title) }).click()
  await expect(page.getByText('Question 1 of 3')).toBeVisible()
}

/** Answer the first `count` questions of a set that is `of` long. */
async function answerAll(page: Page, count: number, how: 'first' | 'idk' = 'first', of = count) {
  for (let i = 0; i < count; i++) {
    await expect(page.getByText(`Question ${i + 1} of ${of}`)).toBeVisible()
    await (how === 'idk' ? page.getByRole('radio', { name: 'I don’t know' }) : page.getByRole('radio').first()).click()
    await page.getByRole('button', { name: /^(Next|Review answers)/ }).click()
    await page.waitForTimeout(450) // let the slide transition finish
  }
}

/** Skip the baseline and say the work is done, which lands on the explanation. */
async function toExplain(page: Page, title: string) {
  await startExercise(page, title)
  await page.getByRole('button', { name: 'Skip the baseline' }).click()
  await page.getByRole('button', { name: 'Skip baseline' }).click()
  await page.getByRole('button', { name: /I’ve already done it/ }).click()
  await page.getByRole('button', { name: 'Continue to the check' }).click()
  await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
}

const box = (page: Page, name: string | RegExp) => page.getByRole('textbox', { name })
const chip = (page: Page, name: string) => page.getByRole('button', { name: `Fill sample text: ${name}` })
const covered = (page: Page) => page.getByText('What you covered', { exact: true })

test.describe('About this prototype', () => {
  test('opens on every load, says what to expect, shows the chip and the needs, and reopens from the header', async ({ browser }) => {
    const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3002' })
    await page.goto('/')
    const dialog = page.getByRole('dialog', { name: 'About this prototype' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('A low-fidelity prototype of one learning flow')).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'What to expect' })).toBeVisible()
    await expect(dialog.getByText('No AI is connected.')).toBeVisible()
    await expect(dialog.getByText(/Judge the flow, not the answers/)).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Fill in answers with the test button' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /Needs from our interviews/ })).toBeVisible()
    // The real chip sits on a mock text box and works.
    await dialog.getByRole('button', { name: 'Fill sample text: example text box' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Example text box' })).toHaveValue(/prepared sample answer/)
    // Each need has an ID, and the partial ones say so.
    for (const id of ['N1', 'N2', 'N3', 'N4', 'N5']) await expect(dialog.getByText(id, { exact: true })).toBeVisible()
    await expect(dialog.getByText('Partly')).toHaveCount(3)
    // The footer button stays in view while the body scrolls.
    await expect(dialog.getByRole('button', { name: 'Start' })).toBeInViewport()
    await dialog.getByRole('button', { name: 'Start' }).click()
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'About this prototype' }).click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.reload()
    await expect(dialog).toBeVisible()
    await page.close()
  })

  test('is reachable from inside a session', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await allowAbout(page)
    await page.getByRole('button', { name: 'About this prototype' }).click()
    await expect(page.getByRole('dialog', { name: 'About this prototype' })).toBeVisible()
  })
})

test.describe('the Fill sample chip', () => {
  test('is hidden until the input is focused, fills only that input, and keeps focus', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await expect(chip(page, 'Your explanation')).toBeHidden()
    await box(page, 'Your explanation').focus()
    await expect(chip(page, 'Your explanation')).toBeVisible()
    await expect(chip(page, 'Your explanation')).toContainText('Fill sample')
    await expect(chip(page, 'Your explanation')).toContainText('Test')
    // Look: dashed border; no opacity transition, only a transform on hover.
    const style = await chip(page, 'Your explanation').evaluate((el) => {
      const c = getComputedStyle(el)
      return { border: c.borderTopStyle, transition: c.transitionProperty, opacity: c.opacity }
    })
    expect(style.border).toBe('dashed')
    expect(style.opacity).toBe('1')
    expect(style.transition).not.toMatch(/opacity|all|color|visibility/)
    await chip(page, 'Your explanation').click()
    await expect(box(page, 'Your explanation')).toHaveValue(/best sum ending at each index/)
    await expect(box(page, 'Your explanation')).toBeFocused()
    await expect(chip(page, 'Your explanation')).toBeVisible()
    await page.getByRole('heading', { name: 'Explain it in your own words' }).click()
    await expect(chip(page, 'Your explanation')).toBeHidden()
  })

  test('is also on the free-text boxes in Work, without changing the chat', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await answerAll(page, 3)
    await page.getByRole('button', { name: 'Save baseline' }).click()
    await page.getByRole('button', { name: /Work on it here/ }).click()
    await expect(page.getByRole('heading', { name: 'Work on it' })).toBeVisible()
    // The help buttons and the check button are where they were.
    for (const name of ['Ask me a question', 'A hint', 'An outline', 'The solution', 'Check my understanding']) await expect(page.getByRole('button', { name })).toBeVisible()
    await box(page, 'Message the companion').focus()
    await chip(page, 'Message the companion').click()
    await expect(box(page, 'Message the companion')).toHaveValue(/best sum ending at each index/)
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('Thinking…')).toBeVisible()
    await page.getByRole('button', { name: 'A hint' }).click()
    await expect(page.getByText('Hint 1 of 3')).toBeVisible()
    // outline blanks
    await page.getByRole('button', { name: 'An outline' }).click()
    const blank = box(page, /Blank for step/).first()
    await blank.focus()
    await page.getByRole('button', { name: /Fill sample text: Blank for step/ }).click()
    await expect(blank).toHaveValue(/\S/)
    await page.getByRole('button', { name: 'Check my blanks' }).click()
    await expect(page.getByText('That works').first()).toBeVisible()
    // the chat bar has no “+” menu, and the check button sits next to the help buttons
    await expect(page.getByRole('button', { name: 'Add your own work' })).toHaveCount(0)
  })

  test('is on the “why” boxes of the final quiz', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await page.getByRole('button', { name: 'Skip this check' }).click()
    await page.getByRole('button', { name: 'Skip this check' }).last().click()
    await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
    await answerAll(page, 3, 'first', 5)
    await page.getByRole('radio').first().click()
    await box(page, 'Why?').focus()
    await chip(page, 'Why?').click()
    await expect(box(page, 'Why?')).toHaveValue(/non-empty/)
  })
})

test.describe('the main path', () => {
  test('can be passed using only the chips, and shows a gap, then the corrected explanation', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await answerAll(page, 3)
    await page.getByRole('button', { name: 'Save baseline' }).click()
    await expect(page.getByRole('heading', { name: 'How do you want to work on this?' })).toBeVisible()
    await expect(page.getByText('Baseline saved')).toBeVisible()
    await page.getByRole('button', { name: /Work on it here/ }).click()
    await page.getByRole('button', { name: 'Check my understanding' }).click()
    await page.getByRole('button', { name: 'Start the check' }).click()
    await expect(page.getByText('Independent check')).toBeVisible()

    // First sample: incomplete, so a gap that points to an earlier one.
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await expect(covered(page)).toBeVisible()
    await expect(page.getByText('Gap · Optimal substructure')).toBeVisible()
    await expect(page.getByText('This has come up before.')).toBeVisible()
    await page.getByRole('button', { name: 'See those answers' }).click()
    await expect(page.getByRole('heading', { name: 'Loop invariant' })).toBeVisible()
    await page.keyboard.press('Escape')

    // Second sample: complete, no gap.
    await page.getByRole('button', { name: 'Edit and submit again' }).click()
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await expect(covered(page)).toBeVisible()
    await expect(page.getByText(/Gap ·/)).toHaveCount(0)

    await page.getByRole('button', { name: 'Continue to the final quiz' }).click()
    await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
    for (let i = 0; i < 5; i++) {
      await page.getByRole('radio').first().click()
      if (i >= 3) { await box(page, 'Why?').focus(); await chip(page, 'Why?').click() }
      await page.getByRole('button', { name: /^(Next|Review answers)/ }).click()
      await page.waitForTimeout(450)
    }
    await page.getByRole('button', { name: /Submit and see my summary/ }).click()
    await expect(page.getByText(/\d of 3 concepts shown without help/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Baseline and final quiz' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What to do next' })).toBeVisible()
    await page.getByRole('button', { name: 'Back to exercises' }).last().click()
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    await expect(page.getByText('Checked · Today')).toBeVisible()
    await expect(page.getByRole('button', { name: exercise('Maximum subarray') })).toBeVisible()
  })

  test('a facilitator can fix the outcome with ⌘K', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Search/ })).toHaveCount(0) // not part of the interface
    await page.keyboard.press('Control+k')
    await page.getByRole('option', { name: /Always complete/ }).click()
    // The choice lives in the page, so move on without reloading.
    await page.getByRole('button', { name: exercise('Maximum subarray') }).click()
    await page.getByRole('button', { name: 'Skip the baseline' }).click()
    await page.getByRole('button', { name: 'Skip baseline' }).click()
    await page.getByRole('button', { name: /I’ve already done it/ }).click()
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await expect(covered(page)).toBeVisible()
    await expect(page.getByText(/Gap ·/)).toHaveCount(0)
  })

  test('work done elsewhere: a sample solution, then the check', async ({ page }) => {
    await startExercise(page, 'Coin change, fewest coins')
    await page.getByRole('button', { name: 'Skip the baseline' }).click()
    await page.getByRole('button', { name: 'Skip baseline' }).click()
    await page.getByRole('button', { name: /I’m working on it elsewhere/ }).click()
    await expect(page.getByRole('heading', { name: 'Work on it elsewhere' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await expect(page.getByText('Paste your solution or attach a photo to continue.')).toBeVisible()
    await box(page, 'Your solution').focus()
    await chip(page, 'Your solution').click()
    await expect(box(page, 'Your solution')).toHaveValue(/def min_coins/)
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
  })

  test('“Why does it work?” and “Find the mistake” are one click from the feedback', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await expect(covered(page)).toBeVisible()
    await page.getByRole('button', { name: /Why does it work\?/ }).click()
    await expect(page.getByText('Question 1 of 3')).toBeVisible()
    // a wrong answer opens “Explain your mistake”, which has a chip
    await page.getByRole('radio').nth(1).click()
    await page.getByRole('button', { name: 'Check my answer' }).click()
    await box(page, /Explain your mistake/).focus()
    await chip(page, 'Explain your mistake').click()
    await expect(box(page, /Explain your mistake/)).toHaveValue(/It does not work because/)
    await page.getByRole('button', { name: 'Next question' }).click()
    await page.getByRole('button', { name: 'Skip this check' }).click()
    await page.getByRole('button', { name: 'Skip', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()

    // Find the mistake, from a fresh start
    await page.getByRole('button', { name: 'Back to exercises' }).click()
    await page.getByRole('button', { name: 'Start over: Maximum subarray' }).click()
    await page.getByRole('alertdialog', { name: 'Start over?' }).getByRole('button', { name: 'Start over' }).click()
    await page.getByRole('button', { name: exercise('Maximum subarray') }).click()
    await page.getByRole('button', { name: 'Skip the baseline' }).click()
    await page.getByRole('button', { name: 'Skip baseline' }).click()
    await page.getByRole('button', { name: /I’ve already done it/ }).click()
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await page.getByRole('button', { name: /Find the mistake/ }).click()
    await expect(page.getByRole('heading', { name: 'One of these steps is wrong' })).toBeVisible()
    await page.getByRole('radio', { name: 'Step 3 is wrong' }).click()
    await page.getByRole('radio').nth(5).click()
    await page.getByRole('button', { name: 'Check my answer' }).click()
    await expect(page.getByText(/You found it|Right step|The mistake was in step/)).toBeVisible()
    await page.getByRole('button', { name: 'Continue to the final quiz' }).click()
    await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
  })

  test('a gap leads to a similar problem that can be completed with chips', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Submit explanation' }).click()
    await page.getByRole('button', { name: 'Continue to the final quiz' }).click()
    await answerAll(page, 5, 'idk')
    await page.getByRole('button', { name: /Submit and see my summary/ }).click()
        await page.getByRole('button', { name: 'Start the similar problem' }).click()
    await expect(page.getByRole('heading', { name: 'A similar problem' })).toBeVisible()
    await page.getByRole('button', { name: /let me try/ }).click()
    await box(page, 'Your explanation').focus()
    await chip(page, 'Your explanation').click()
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await answerAll(page, 2)
    await page.getByRole('button', { name: 'Submit the check' }).click()
    await expect(page.getByRole('heading', { name: 'What the similar problem showed' })).toBeVisible()
    await expect(page.getByText('First attempt').first()).toBeVisible()
    await page.getByRole('button', { name: 'Back to summary' }).click()
    await expect(page.getByRole('heading', { name: 'Attempts' })).toBeVisible()
  })
})

test.describe('skipping, postponing and help', () => {
  test('skipping the final quiz leaves it unverified in the summary', async ({ page }) => {
    await startExercise(page, 'Binary search and its invariant')
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
    await expect(page.getByText('No concept shown without help')).toBeVisible()
    await expect(page.getByText('You skipped the baseline.')).toBeVisible()
    await expect(page.getByText('You skipped explain it back.')).toBeVisible()
  })

  test('“Do this later” keeps the check as postponed, not as evidence', async ({ page }) => {
    await startExercise(page, 'Binary search and its invariant')
    await page.getByRole('button', { name: 'Skip the baseline' }).click()
    await page.getByRole('button', { name: 'Do this later' }).click()
    await page.getByRole('button', { name: /I’ve already done it/ }).click()
    await page.getByRole('button', { name: 'Continue to the check' }).click()
    await page.getByRole('button', { name: 'Skip this check' }).click()
    await page.getByRole('button', { name: 'Do this later' }).click()
    await expect(page.getByRole('heading', { name: 'The same questions, once more' })).toBeVisible()
    await page.getByRole('button', { name: 'Skip this check' }).click()
    await page.getByRole('button', { name: 'Do this later' }).click()
    await expect(page.getByText('No concept shown without help')).toBeVisible()
    await expect(page.getByText('You postponed explain it back.')).toBeVisible()
    await expect(page.getByText('Postponed').first()).toBeVisible()
    await page.getByRole('button', { name: 'Do it now' }).click()
    await expect(page.getByRole('heading', { name: 'Explain it in your own words' })).toBeVisible()
  })

  test('references during a check make it assisted and keep the draft', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await box(page, 'Your explanation').fill('Each position keeps the best sum ending there and either extends or starts fresh.')
    await page.getByRole('button', { name: 'Show references' }).click()
    await page.getByRole('button', { name: 'Open references' }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByText('This check no longer counts as independent evidence.')).toBeVisible()
    await expect(box(page, 'Your explanation')).toHaveValue(/best sum ending there/)
  })
})

test.describe('exercise list, resume, start over and refresh', () => {
  test('one click starts an exercise, and the back arrow keeps its place', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await answerAll(page, 3)
    await page.getByRole('button', { name: 'Save baseline' }).click()
    await expect(page.getByRole('heading', { name: 'How do you want to work on this?' })).toBeVisible()
    await page.getByRole('button', { name: 'Back to exercises' }).click()
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    await expect(page.getByText('In progress · Prepare')).toBeVisible()
    await page.getByRole('button', { name: 'Resume: Maximum subarray' }).click()
    await expect(page.getByRole('heading', { name: 'How do you want to work on this?' })).toBeVisible()
    // another exercise starts without a question about the first
    await page.getByRole('button', { name: 'Back to exercises' }).click()
    await page.getByRole('button', { name: exercise('Coin change, fewest coins') }).click()
    await expect(page.getByText('Question 1 of 3')).toBeVisible()
  })

  test('start over asks first and returns the exercise to the baseline', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await page.getByRole('button', { name: 'Back to exercises' }).click()
    await page.getByRole('button', { name: 'Start over: Maximum subarray' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Start over?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Resume: Maximum subarray' })).toBeVisible()
    await page.getByRole('button', { name: 'Start over: Maximum subarray' }).click()
    await dialog.getByRole('button', { name: 'Start over' }).click()
    await expect(page.getByRole('button', { name: exercise('Maximum subarray') })).toBeVisible()
    await expect(page.getByRole('button', { name: /Start over: Maximum subarray/ })).toHaveCount(0)
  })

  test('a refresh resets everything', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await page.getByRole('button', { name: 'Back to exercises' }).click()
    await expect(page.getByText('In progress · Prepare')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    await expect(page.getByText('In progress')).toHaveCount(0)
    expect(await page.evaluate(() => Object.keys(localStorage).filter(k => k.includes('workspace')))).toEqual([])
  })

  test('a refresh inside a session lands on the list with a note, not a broken screen', async ({ page }) => {
    await toExplain(page, 'Maximum subarray')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    await expect(page.getByText('There is no open session. Start an exercise below.')).toBeVisible()
  })
})

test.describe('Exercises and Concepts', () => {
  test('exercises are grouped by topic and name the concepts they check', async ({ page }) => {
    await page.goto('/')
    for (const topic of ['Dynamic programming', 'Binary search', 'Graph traversal']) await expect(page.getByRole('heading', { name: topic, level: 2 })).toBeVisible()
    await expect(page.getByText('Concepts: State · Recurrence · Optimal substructure')).toBeVisible()
    await expect(page.getByText('Concepts: State · Recurrence · Base cases')).toBeVisible()
    await expect(page.getByText(/\d of \d concepts shown without help/).first()).toBeVisible()
  })

  test('concepts are shared by topic, not by exercise, and a concept can be practised', async ({ page }) => {
    await page.goto('/concepts')
    await expect(page.getByRole('heading', { name: 'Concepts', level: 1 })).toBeVisible()
    // each concept appears once in its topic, however many exercises check it
    await expect(page.getByRole('list', { name: 'Dynamic programming concepts' }).getByRole('listitem')).toHaveCount(4)
    await expect(page.getByRole('list', { name: 'Binary search concepts' }).getByRole('listitem')).toHaveCount(3)
    await expect(page.getByText('Not shown').first()).toBeVisible()
    await page.getByRole('button', { name: /^Loop invariant/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Practise this concept' }).click()
    await expect(page.getByText(/Question 1 of [2-4]/)).toBeVisible()
    const total = Number((await page.getByText(/Question 1 of \d/).innerText()).match(/of (\d)/)![1])
    await answerAll(page, total)
    await page.getByRole('button', { name: 'Submit answers' }).click()
    await expect(page.getByRole('heading', { name: 'What changed' })).toBeVisible()
    await page.getByRole('button', { name: 'Back to concepts' }).click()
    await expect(page.getByRole('heading', { name: 'Concepts', level: 1 })).toBeVisible()
  })

  test('a topic can be collapsed', async ({ page }) => {
    await page.goto('/concepts')
    const list = page.getByRole('list', { name: 'Graph traversal concepts' })
    await expect(list).toBeVisible()
    await page.getByRole('button', { name: /^Graph traversal/ }).click()
    await expect(list).toBeHidden()
  })

  test('the questions to answer again can be practised, and the baseline questions say what they are about', async ({ page }) => {
    await page.goto('/concepts')
    await page.getByRole('button', { name: /Practise 3 due/ }).click()
    await expect(page.getByRole('heading', { name: 'Due questions' })).toBeVisible()
    await answerAll(page, 3)
    await page.getByRole('button', { name: 'Submit answers' }).click()
    await expect(page.getByRole('heading', { name: 'What changed' })).toBeVisible()
    // questions are self-contained: they name the exercise's setting instead of using undefined symbols
    await page.getByRole('button', { name: 'Back to concepts' }).click()
    await page.getByRole('link', { name: 'Exercises', exact: true }).click()
    await page.getByRole('button', { name: exercise('Maximum subarray') }).click()
    await expect(page.getByText('In the usual dynamic-programming solution to maximum subarray')).toBeVisible()
  })
})

test.describe('simpler screens', () => {
  test('the exercise list has a course selector with the one course', async ({ page }) => {
    await page.goto('/')
    const select = page.getByRole('combobox', { name: 'Course' })
    await expect(select).toContainText('Algorithms and Data Structures')
    await select.click()
    await expect(page.getByRole('option')).toHaveCount(1)
  })

  test('the baseline has no “Next” line, and Edit shows only on hover', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await expect(page.getByText('Next:')).toHaveCount(0)
    await answerAll(page, 3)
    const edit = page.getByRole('button', { name: 'Edit answer 1' })
    await expect(edit).toHaveCSS('opacity', '0')
    await page.getByRole('listitem').filter({ hasText: 'What does' }).first().hover()
    await expect(edit).toHaveCSS('opacity', '1')
  })

  test('“Check my understanding” sits next to the help buttons', async ({ page }) => {
    await startExercise(page, 'Maximum subarray')
    await answerAll(page, 3)
    await page.getByRole('button', { name: 'Save baseline' }).click()
    await page.getByRole('button', { name: /Work on it here/ }).click()
    const check = page.getByRole('button', { name: 'Check my understanding' })
    const hint = page.getByRole('button', { name: 'A hint' })
    const [c, h] = [await check.boundingBox(), await hint.boundingBox()]
    expect(Math.abs(c!.y - h!.y)).toBeLessThan(40)
    expect(c!.y).toBeGreaterThan(400)
  })

  test('the answers panel groups answers by exercise, with a plain reason when a status does not count', async ({ page }) => {
    await page.goto('/concepts')
    await page.getByRole('button', { name: /^State/ }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet.getByText('Not shown yet')).toBeVisible()
    await expect(sheet.getByText('You used help, so these answers do not count.')).toBeVisible()
    await expect(sheet.getByRole('heading', { name: 'Maximum subarray' })).toBeVisible()
    await expect(sheet.getByText('Answered with help').first()).toBeVisible()
  })
})

test.describe('layout', () => {
  for (const [name, size] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]] as const) {
    test(`no horizontal overflow on ${name}`, async ({ page }) => {
      await page.setViewportSize(size)
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      for (const path of ['/', '/concepts']) {
        await page.goto(path)
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
        await page.waitForTimeout(500)
        expect(await overflow(), path).toBeLessThanOrEqual(0)
      }
      await toExplain(page, 'Maximum subarray')
      await page.waitForTimeout(500)
      expect(await overflow(), 'explain').toBeLessThanOrEqual(0)
      await allowAbout(page)
      await page.getByRole('button', { name: 'About this prototype' }).click()
      const dialog = page.getByRole('dialog', { name: 'About this prototype' })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'Start' })).toBeInViewport()
      expect(await overflow(), 'about').toBeLessThanOrEqual(0)
    })
  }
})
