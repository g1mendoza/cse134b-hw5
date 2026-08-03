/* Data and Secrets Requirements */

const CITIES = {
  "San Diego": { lat: 32.7157, lon: -117.1611, tz: "America/Los_Angeles" },
  "Phoenix": { lat: 33.4484, lon: -112.0740, tz: "America/Phoenix" },
};

// Cache responses in sessionStorage or localStorage with a sensible
// TTL so reloading during development does not hammer a public service 
const CACHE_TTL_MS = 10 * 60 * 1000;

/* Rendering requirements */

// Include a request timeout so a hanging network does not leave the widget loading forever 
const FETCH_TIMEOUT_MS = 8000;

const uvLabel = (uv) => {
  if (uv <= 2) return "LOW";
  if (uv <= 5) return "MODERATE";
  if (uv <= 7) return "HIGH";
  return "VERY HIGH TO EXTREME";
};

const verdictFor = (uv) => {
  if (uv <= 2) return "Nonexistent Tan";
  if (uv <= 5) return "Tanning possible";
  if (uv <= 7) return "Perfect TANNNNNNG UV!";
  return "Skin can burn";
};

/* Structural Requirements*/

// Use a valid custom-element name containing a hyphen and no reserved names,
// registered with customElements.define.
class TanningOpportunity extends HTMLElement {
  // Declare observedAttributes and implement attributeChangedCallback
  static observedAttributes = ["location"];
  #controller = null;
  #template = null;
  // Use connectedCallback for setup 
  connectedCallback() {
    this.#template = document.getElementById("tanning-template");
    // Idle/empty: before a request or when there are no results 
    this.setAttribute("state", "idle");
    this.#load();
  }
  // Use disconnectedCallback for teardown. In-flight requests must be canceled on 
  // disconnect—for example, with AbortController
  disconnectedCallback() {
    if (this.#controller) {
      this.#controller.abort();
    }
  }
  // At least one attribute must meaningfully reconfigure the component at runtime.
  // Changing it in DevTools should visibly change the rendered output
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "location" && oldValue !== newValue && this.isConnected) {
      this.#load();
    }
  }
  async #load() {
    if (this.#controller) {
      this.#controller.abort();
    }
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    const locationName = this.getAttribute("location") || "San Diego";
    const city = CITIES[locationName];
    if (!city) {
      // Error: a clear, human-readable message plus a retry affordance, if appropriate
      this.setAttribute("state", "error");
      this.#renderError(`Unknown location "${locationName}".`);
      return;
    }
    // Cache responses in sessionStorage or localStorage with a sensible TTL so reloading
    // during development does not hammer a public service
    const cacheKey = `tanning-cache:${locationName}`;
    const cached = this.#readCache(cacheKey);
    if (cached) {
      this.setAttribute("state", "ready");
      this.#renderData(locationName, cached);
      return;
    }
    // Loading: a real indication, not a frozen blank box
    this.setAttribute("state", "loading");
    this.#renderLoading();
    // Include a request timeout so a hanging network does not leave the widget loading forever
    const timeoutId = setTimeout(() => this.#controller.abort(), FETCH_TIMEOUT_MS);
    try {
      // Prefer a keyless public API. Open-Mateo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,uv_index&temperature_unit=fahrenheit&timezone=${encodeURIComponent(city.tz)}&forecast_days=1`;
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      this.#writeCache(cacheKey, data);
      // Success: data rendered semantically. A list of items is a list
      this.setAttribute("state", "ready");
      this.#renderData(locationName, data);
    } catch (error) {
      if (signal.aborted) return;
      this.setAttribute("state", "error");
      this.#renderError("Couldn't load the forecast. Please try again.");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /* Rendering Requirements */
  #renderLoading() {
    this.textContent = "";
    const p = document.createElement("p");
    p.className = "tanning-loading";
    p.textContent = "Checking the sky…";
    this.append(p);
  }
  // Error: a clear, human-readable message plus a retry affordance, if appropriate
  #renderError(message) {
    this.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.className = "tanning-error";
    const p = document.createElement("p");
    p.textContent = message;
    wrapper.append(p);
    this.append(wrapper);
  }
  // Produce markup by cloning a <template> and populating it with textContent, setAttribute,
  // or DOM node creation. Do not build markup by concatenating remote data into an innerHTML string
  #renderData(locationName, data) {
    const clone = this.#template.content.cloneNode(true);
    const now = new Date();
    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const uvs = data.hourly.uv_index;

    let startIndex = times.findIndex((t) => new Date(t) >= now);

    if (startIndex === -1) startIndex = 0;
    clone.querySelector("[data-location]").textContent = locationName;
    clone.querySelector("[data-current-temp]").textContent = Math.round(temps[startIndex]);
    clone.querySelector("[data-current-uv]").textContent = uvs[startIndex].toFixed(1);
    clone.querySelector("[data-uv-label]").textContent = uvLabel(uvs[startIndex]);
    clone.querySelector("[data-verdict]").textContent = verdictFor(uvs[startIndex]);

    // Success: data rendered semantically. A list of items is a list 
    const list = clone.querySelector("[data-hourly-list]");

    for (let i = startIndex; i < Math.min(startIndex + 6, times.length); i++) {
      const li = document.createElement("li");
      const timeSpan = document.createElement("span");

      timeSpan.className = "hour-time";
      timeSpan.textContent = new Date(times[i]).toLocaleTimeString([], { hour: "numeric" });

      const tempSpan = document.createElement("span");

      tempSpan.className = "hour-temp";
      tempSpan.textContent = `${Math.round(temps[i])}°F`;

      const uvSpan = document.createElement("span");

      uvSpan.className = "hour-uv";
      uvSpan.textContent = `UV ${uvs[i].toFixed(1)}`;

      li.append(timeSpan, tempSpan, uvSpan);
      list.append(li);
    }
    this.textContent = "";
    this.append(clone);
  }

  /* Data and Secrets Requirements */

  // Cache responses in sessionStorage or localStorage with a sensible TTL so reloading
  //  during development does not hammer a public service 
  #readCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const { savedAt, data } = JSON.parse(raw);
      if (Date.now() - savedAt > CACHE_TTL_MS) return null;
      return data;
    } catch {
      return null;
    }
  }

  #writeCache(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
    }
  }
}

// Use a valid custom-element name containing a hyphen and no reserved names, registered 
// with customElements.define 
customElements.define("tanning-opportunity", TanningOpportunity);