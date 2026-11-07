# Route Check

A simple web page that tells you how far a new customer is from an installer's other jobs that day, so you don't book one service in Santa Clarita and the next in Palm Desert.

Type in a ZIP code or a city name, and Route Check shows the distance on a map with a clear call: **Close**, **Check first**, or **Too far**.

No login, no install, nothing to download. It runs in any web browser.

---

## Why this exists

When scheduling a service, the old way was:

1. Open the load list and filter by date and another job
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

Built by Alex Colin.
