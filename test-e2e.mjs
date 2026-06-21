import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = `file:///${dir.replace(/\\/g, "/")}/index.html`;

const failures = [];
const passes = [];

function assert(name, cond, detail = "") {
  if (cond) passes.push(name);
  else failures.push({ name, detail });
}

async function waitForSim(page) {
  await page.waitForFunction(() => {
    const t = document.getElementById("timeline");
    return t && t.innerHTML.trim().length > 50;
  }, { timeout: 15000 });
}

async function getState(page) {
  return page.evaluate(() => ({
    lifeMode: window.__testState?.lifeMode ?? (() => {
      try {
        const raw = localStorage.getItem("summer-life-simulator-v7");
        return raw ? JSON.parse(raw).lifeMode : null;
      } catch { return null; }
    })(),
    monKidCare: (() => {
      const raw = localStorage.getItem("summer-life-simulator-v7");
      if (!raw) return null;
      return JSON.parse(raw).schedules?.[0]?.kidCareType;
    })(),
    timeline: document.getElementById("timeline")?.textContent || "",
    pageTitle: document.getElementById("pageTitle")?.textContent || "",
    campHidden: document.getElementById("campDaysRow")?.classList.contains("hidden"),
    schoolHintVisible: !document.getElementById("schoolDaysHint")?.classList.contains("hidden"),
    lifeModeValue: document.getElementById("lifeModeSelect")?.value
  }));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (err) => failures.push({ name: "pageerror", detail: err.message }));

  try {
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForLoadState("load");
    await waitForSim(page);

    let s = await getState(page);
    assert("loads and simulates", s.timeline.length > 50, s.timeline.slice(0, 80));
    assert("default summer mode", s.lifeModeValue === "summer", s.lifeModeValue);
    assert("summer title", s.pageTitle.includes("Summer"), s.pageTitle);

    // Switch to school year
    await page.selectOption("#lifeModeSelect", "school");
    await page.waitForTimeout(500);

    s = await getState(page);
    assert("school mode selected", s.lifeModeValue === "school", s.lifeModeValue);
    assert("title updates to school", s.pageTitle.includes("School"), s.pageTitle);
    assert("camp row hidden", s.campHidden === true, String(s.campHidden));
    assert("school hint visible", s.schoolHintVisible === true, String(s.schoolHintVisible));

    const monCare = await page.evaluate(() => {
      const raw = localStorage.getItem("summer-life-simulator-v7");
      const data = JSON.parse(raw);
      return {
        kidCareType: data.schedules[0].kidCareType,
        kidWake: data.schedules[0].kidWake,
        dinnerTime: data.schedules[0].dinnerTime,
        lifeMode: data.lifeMode
      };
    });
    assert("lifeMode saved", monCare.lifeMode === "school", monCare.lifeMode);
    assert("monday school care", monCare.kidCareType === "school", monCare.kidCareType);
    assert("monday early wake", monCare.kidWake === "06:45", monCare.kidWake);
    assert("monday dinner 7pm", monCare.dinnerTime === "19:00", monCare.dinnerTime);

    // Kids tab shows school option
    await page.click('button[data-semi="kids"]');
    await page.waitForTimeout(300);
    const schoolOption = await page.locator('#wk-kid-care-type-0 option[value="school"]').count();
    assert("kids tab has school option", schoolOption === 1, String(schoolOption));

    // Simulate and check timeline for school
    await page.click('button[data-semi="sim"]');
    await page.waitForTimeout(200);
    await page.click("#simulateWeek");
    await waitForSim(page);
    const timeline = await page.textContent("#timeline");
    assert("timeline mentions school", /school/i.test(timeline), timeline.slice(0, 200));

    // Reload persistence
    await page.reload({ waitUntil: "load" });
    await waitForSim(page);
    s = await getState(page);
    assert("school mode persists reload", s.lifeModeValue === "school", s.lifeModeValue);

    // Switch back to summer
    await page.selectOption("#lifeModeSelect", "summer");
    await page.waitForTimeout(300);
    s = await getState(page);
    assert("summer restored", s.lifeModeValue === "summer", s.lifeModeValue);
    assert("camp row visible", s.campHidden === false, String(s.campHidden));

    // Test meals tab loads
    await page.click('button[data-semi="meetings"]');
    await page.waitForTimeout(200);
    const meetingsCols = await page.locator("#weeklyDadDays .weekly-day-card").count();
    assert("meetings tab 7 days", meetingsCols === 7, String(meetingsCols));

    await page.click('button[data-semi="meals"]');
    await page.waitForTimeout(200);
    const mealsCols = await page.locator("#weeklyMealsDays .weekly-meals-card").count();
    assert("meals tab 7 days", mealsCols === 7, String(mealsCols));

    await page.click("#spinDinnerWheel");
    await page.waitForTimeout(4500);
    const wheelResult = await page.textContent("#wheelResult");
    assert("spin wheel result", wheelResult && wheelResult.includes(":"), wheelResult);

    // Legend reflects selected day's work location
    await page.click('button[data-semi="sim"]');
    let legendDad = await page.textContent("#legendDad");
    assert("legend dad has name", legendDad.includes("You"), legendDad);
    assert("legend shows location tag", /\((WFH|Office|Off \/ PTO)\)/.test(legendDad), legendDad);
    await page.locator("#weekTabs button", { hasText: /^Tue/ }).click();
    await page.waitForTimeout(200);
    legendDad = await page.textContent("#legendDad");
    assert("legend tue shows office", legendDad.includes("Office"), legendDad);

  } catch (e) {
    failures.push({ name: "exception", detail: e.message });
  } finally {
    await browser.close();
  }

  console.log("\n=== PASSES ===");
  passes.forEach((p) => console.log("✓", p));
  console.log("\n=== FAILURES ===");
  failures.forEach((f) => console.log("✗", f.name, f.detail || ""));
  console.log(`\n${passes.length} passed, ${failures.length} failed`);
  process.exit(failures.length ? 1 : 0);
}

run();