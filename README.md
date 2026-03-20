# Chance It?

A deeply serious tool for Bayesian decision-making under uncertainty.

---

## The Proposition

You have a band. Maybe it's pretty good. Maybe it's Creed. The question before you is ancient and profound: **is the grass greener?**

This app operationalizes that question. You are shown an artist drawn from a curated prior distribution. You can accept it — locking in your known utility — or you can *chance it*, sampling from the posterior with replacement. The catch, of course, is that the distribution is flat. Every artist has equal probability mass. Your prior is irrelevant. The universe does not negotiate.

This is, in the loosest possible interpretation of the word, a lesson in Bayesian reasoning:

- **Your prior**: how good is the band you currently have?
- **The likelihood**: given that you sampled from this list, what are the odds you do better?
- **The posterior**: still a uniform distribution. You're not updating anything. You're just hoping.

The expected value of chancing it is exactly the mean utility of all artists on the list. Whether that's above or below your current artist is left as an exercise to the reader. 

---

## Architecture

```
chance_it/
├── app.py              # Flask backend — serves the UI, proxies Deezer,
│                       #   manages in-memory session artists
├── artists.json        # The prior distribution. Curated by hand. Edit freely.
├── templates/
│   └── index.html      # Single-page UI — minimal markup, links to static assets
├── static/
│   ├── style.css       # Dark theme, Space Grotesk font, amber accent
│   └── app.js          # Spinner animation, Deezer preview playback, add-artist logic
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

**Key design decisions:**
- Artist data lives in `artists.json` — a flat list of `{ label, search }` objects. `label` is what the spinner shows. `search` is the Deezer query. They can be different, which is the whole point.
- Music previews are 30-second clips via the [Deezer API](https://developers.deezer.com/api) (no account required). Flask proxies the search to avoid CORS; the browser plays the returned CDN URL directly.
- Temporary artists added in the UI are stored in a module-level Python list — they live for the duration of the server process and are gone on restart. This is a feature.

---

## Running It

### With Docker (recommended)

```bash
docker compose up
```

Open [http://localhost:5000](http://localhost:5000).

To update the artist list without rebuilding, just edit `artists.json` — it's mounted as a volume. Restart the container to pick up changes:

```bash
docker compose restart
```

### Without Docker

```bash
pip install -r requirements.txt
flask run
```

---

## Editing the Artist List

`artists.json` is the source of truth. Each entry:

```json
{ "label": "Weezer (not Pinkerton or the Blue album)", "search": "Weezer Beverly Hills" }
```

- **`label`** — displayed in the spinner.
- **`search`** — sent to Deezer. Specific song queries work best (e.g. `"Radiohead Karma Police"`). If Deezer finds nothing, the spin still works — there's just no preview.


---

## The Honest Fine Print

This is not actually a Bayesian tool. The posterior is uniform. You have no conjugate prior. There is no likelihood function. There is only the wheel, and the wheel does not care about your beliefs.

Spin responsibly.
