# Summer Life Simulator

A single-page web app for planning a summer week when kids are home and both parents mix work-from-home and office days. Enter real schedules, run a simulation, and see where the day gets tight — overlapping meetings, solo-parent crunch, camp gaps, and late dinners.

No install, no server. Open `index.html` in any modern browser.

## Quick start

1. Open `index.html` (double-click or drag into Chrome, Edge, Firefox, etc.).
2. Set family names and office days under **Family & schedules**.
3. Fill in work hours, meetings, kids sleep/camp/activities, and dinner times.
4. Click **Simulate week** to build the timeline and weekly insights.
5. Use day tabs to walk through Mon–Sun.

## Tabs

| Tab | What you edit |
|-----|----------------|
| **Week simulation** | Timeline, stats, insights, and event log after you simulate |
| **Family & schedules** | Names, office-day pickers, per-day parent work hours, commute, meetings, and lunch |
| **Weekly meetings** | Full week side-by-side — your meetings and your partner's, plus lunch per day |
| **Kids schedule** | Wake/bed, dinner time (7–10 PM), camp/daycare, activities, and camp auto-fill |

## Schedule formats

**Meetings** (one per line):

```
9:00-10:00 Team standup
14:00-15:00 Client review
```

**Kid activities** (add `[away]` when kids leave the house):

```
9:00-11:00 Swim [away]
16:00-17:00 Free play at home
```

**Dinner** — pick 7:00, 8:00, 9:00, or 10:00 PM per day (default 9:00 PM). Use **Apply to week** to set the same time for all days.

## What the sim shows

- **Timeline** — wake, camp drop-off/pickup, work blocks, meetings, lunch, dinner, bedtime, and wind-down
- **Conflict flags** — solo-parent days, both parents at office without coverage, overlapping meetings, dinner after bedtime
- **Stats** — work focus, sanity, kid happiness, couple bandwidth
- **Insights** — office balance, crunch days, meeting overlap, late-dinner warnings

## Saving your data

Settings and schedules are saved automatically in the browser **localStorage** (key: `summer-life-simulator-v5`). Names, office days, themes, and all per-day fields persist when you close the tab and come back.

- Saved: family info, schedules, theme, dark mode, last tab
- Not saved: simulation run (stats/timeline/log) — click **Simulate week** again after returning

Data stays on **this computer in this browser**. Clearing browser/site data removes it.

## Appearance

- **Themes:** Summer, Autumn, Winter, Spring, Ocean, Sunset
- **Dark mode** toggle in the header

## Development

The entire app is one file: `index.html` (HTML, CSS, and JavaScript). Edit and refresh the browser to test.

```bash
# Optional: serve locally instead of opening the file directly
npx --yes serve .
```

## License

Personal / family use. Adapt freely for your own household planning.