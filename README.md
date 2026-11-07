# Route Check

A simple web page that tells you how far a new customer is from an installer's other jobs that day, so you don't book one service in Santa Clarita and the next in Palm Desert.

Type in a ZIP code or a city name, and Route Check shows the distance on a map with a clear call: **Close**, **Check first**, or **Too far**.

No login, no install, nothing to download. It runs in any web browser.

---

## Why this exists

When scheduling a service, the old way was:

1. Open the load list and filter by date and installer
2. Copy each job's ZIP code
3. Paste it into Google Maps
4. Check how far it is from the new customer
5. Repeat for every job that day

Route Check does all of that on one screen. Installers get routes that make sense, and schedulers stop guessing.

---

## How to use it

1. **Add the installer's jobs for that day.** Type the ZIP code (like `91355`) or the city (like `Santa Clarita`) of each job already on the load list, then click **Add job**. Add as many as you need.
2. **Enter the new customer.** Type their ZIP code or city and click **Check**.
3. **Read the result.**

| Result | Distance | What to do |
|---|---|---|
| 🟢 **Close** | Under 20 miles | Good to schedule |
| 🟡 **Check first** | 20 to 40 miles | Check with the installer or look for a closer day |
| 🔴 **Too far** | Over 40 miles | Find a day the installer is already in that area |

The map draws a line from each booked job to the customer with the miles on it. Each row in the table has an **Open** link that pulls up the real route in Google Maps, with traffic.

**Tips**
- A ZIP code is more accurate than a city name. Use the ZIP when you have it.
- Remove a job with the **×** next to it. **Clear all jobs** starts fresh for the next installer.
- Your job list stays saved in your own browser if you close the page.

---

## Good to know

- **Distances are estimates.** They're measured from the center of each ZIP code and adjusted for roads, not pulled from live traffic. They're great for spotting a bad pairing, but use the Google Maps link for the exact drive.
- **Covers all of California.** Other states can be added (see below).
- **No customer data leaves your computer.** Everything runs in your browser. Nothing you type is sent anywhere or stored on a server.

---

## Putting it on GitHub Pages (one-time setup)

This gives your team a link they can bookmark, like `https://your-username.github.io/route-check/`.

1. Sign in to [GitHub](https://github.com) and click **New repository**.
2. Name it `route-check`. Set it to **Public** (GitHub Pages is free for public repos). Click **Create repository**.
3. Click **uploading an existing file**, drag in everything from this folder (`index.html`, `app.js`, `README.md`, and the `data` and `scripts` folders), and click **Commit changes**.
4. Go to **Settings → Pages**.
5. Under **Source**, pick **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.
6. Wait a minute or two, then refresh. Your link appears at the top of the Pages screen. Share it with the team.

> **Heads up:** a public repo means anyone with the link can see the page and its code. That's fine here because there's no customer or company data in it, only public ZIP code locations. Don't add customer names, addresses, or anything internal to this repo.

---

## Changing things

### Distance cutoffs
Open `app.js` and find the `grade` function:

```js
function grade(mi){ return mi<20?['good','Close']: mi<=40?['warn','Check first']:['bad','Too far']; }
```

Change `20` and `40` to whatever fits your market. Update the legend in `index.html` to match.

### Drive time estimate
In `app.js`, `driveMin` assumes about 32 mph on shorter trips (city traffic) and 50 mph on longer ones (freeway), plus 5 minutes. Adjust if your area runs faster or slower.

### Road adjustment
Straight-line distance is multiplied by `1.3` in the `miles` function to account for roads not being straight. Raise it for areas with lots of mountains or winding roads.

### Adding more states
You'll need Python installed.

```bash
pip install zipcodes
python scripts/build_zip_data.py CA NV AZ
```

This rewrites `data/zip-data.js` with every state you list. Upload the new file to GitHub.

---

## What's in this folder

```
route-check/
├── index.html              The page itself (layout and styles)
├── app.js                  Lookups, distance math, and the map
├── data/
│   └── zip-data.js         California ZIP code centers, cities, and counties
├── scripts/
│   └── build_zip_data.py   Rebuilds the ZIP data (only needed to add states)
└── README.md               This file
```

To try it on your own computer before posting, just double-click `index.html`.

---

## Credits

ZIP code locations come from the [`zipcodes`](https://pypi.org/project/zipcodes/) Python package. Map is drawn from those ZIP points, so no map service or API key is needed.

Built by Alex Colin.
