document.addEventListener("DOMContentLoaded", () => {
  // --- UI elements ---
  const runBtn = document.querySelector(".card.left .btn");
  const viewInsightsBtn = document.querySelector(".card.right a .btn"); 
  const boxes = document.querySelectorAll(".preview-boxes .box"); 
  const recommendBox = document.querySelector(".recommendation-box");
  const questionInput = document.querySelector(".question-box input");
  const questionBtn = document.querySelector(".question-box .search-btn");

  // Slider display
  const slider = document.getElementById("recycling_rate");
  const sliderVal = document.getElementById("recycling_rate_val");
  if (slider && sliderVal) {
    sliderVal.innerText = slider.value;
    slider.addEventListener("input", () => sliderVal.innerText = slider.value);
  }

  // Defaults and state
  const API_BASE = "https://lca-backend-1i20.onrender.com";
  let lastResult = null; 
  if (viewInsightsBtn) viewInsightsBtn.disabled = true;

  // Helpers
  function isValidNumber(value) {
    if (value === null || value === undefined) return false;
    return /^-?\d+(\.\d+)?$/.test(String(value).trim());
  }

  function formatTopFactors(tf) {
    try {
      if (!tf) return "N/A";
      if (Array.isArray(tf)) return tf.join(", ");
      if (typeof tf === "object") {
        return Object.entries(tf).map(([k, v]) => `${k}: ${v}%`).join(", ");
      }
      return String(tf);
    } catch (e) {
      return "N/A";
    }
  }

  function formatRecommendations(rec) {
    if (!rec) return ["No recommendations."];
    if (Array.isArray(rec)) return rec;
    return [String(rec)];
  }

  function setLoading(isLoading, forFollowUp = false) {
    if (isLoading) {
      if (runBtn) runBtn.disabled = true;
      if (questionBtn) questionBtn.disabled = true;
      if (!forFollowUp) {
        if (viewInsightsBtn) viewInsightsBtn.disabled = true;
        boxes.forEach(b => b.innerText = "Loading...");
        recommendBox.innerText = "Loading...";
      }
    } else {
      if (runBtn) runBtn.disabled = false;
      if (questionBtn) questionBtn.disabled = false;
    }
  }

  function collectInputs() {
    return {
      materialType: document.getElementById("material_type")?.value || "",
      scrapRaw: document.getElementById("scrap_kg")?.value ?? "",
      costRaw: document.getElementById("cost_usd_per_kg")?.value ?? "",
      co2Raw: document.getElementById("co2_kg_per_kg")?.value ?? "",
      transportRaw: document.getElementById("transport_km")?.value ?? "",
      recyclingRaw: document.getElementById("recycling_rate")?.value ?? "",
      smeltingRaw: document.getElementById("smelting_energy")?.value ?? "",
      miningRaw: document.getElementById("mining_energy")?.value ?? "",
      waterRaw: document.getElementById("water_usage_l_per_kg")?.value ?? ""
    };
  }

  // --- RUN ANALYSIS ---
  async function runAnalysis() {
    // Clear old conversation and last results
    localStorage.removeItem("lcaConversationId");
    lastResult = null;

    const { materialType, scrapRaw, costRaw, co2Raw,
            transportRaw, recyclingRaw, smeltingRaw, miningRaw, waterRaw } = collectInputs();

    if (!materialType || materialType === "Select Material") {
      alert("Please select a valid Material Type.");
      return;
    }

    const numberFields = {
      "Scrap available": scrapRaw,
      "Production cost": costRaw,
      "CO2": co2Raw,
      "Transport Distance": transportRaw,
      "Recycling rate": recyclingRaw,
      "Smelting energy": smeltingRaw,
      "Mining energy": miningRaw,
      "Water usage": waterRaw
    };

    for (const [name, val] of Object.entries(numberFields)) {
      if (!isValidNumber(String(val))) {
        alert(`Please enter a valid number for ${name}.`);
        return;
      }
    }

    const inputs = {
      material: materialType,
      scrap_available: parseFloat(scrapRaw),
      production_cost_usd_per_kg: parseFloat(costRaw),
      co2_kg_per_kg: parseFloat(co2Raw),
      transport_km: parseFloat(transportRaw),
      recycling_rate: parseFloat(recyclingRaw) / 100,
      smelting_energy_mj_per_kg: parseFloat(smeltingRaw),
      mining_energy_mj_per_kg: parseFloat(miningRaw),
      water_usage_l_per_kg: parseFloat(waterRaw)
    };

    const role = localStorage.getItem("userRole") || "sustainability manager";

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, inputs })
      });

      const json = await res.json().catch(async () => {
        const txt = await res.text();
        throw new Error("Invalid JSON from server: " + txt);
      });

      if (!res.ok) throw new Error(json.error || `Server returned ${res.status}`);

      lastResult = json;

      // Save results and conversation ID
      localStorage.setItem("lcaResults", JSON.stringify({ inputs, output: json }));
      if (json.conversation_id) {
        lastResult.conversation_id = json.conversation_id;
        localStorage.setItem("lcaConversationId", String(json.conversation_id));
      }

      boxes[0].innerText = (json.impact_score !== undefined && json.impact_score !== null)
        ? Number(json.impact_score).toFixed(2)
        : "N/A";
      boxes[1].innerText = json.impact_level || "N/A";
      boxes[2].innerText = formatTopFactors(json.top_factors);

      recommendBox.innerHTML = "";
      formatRecommendations(json.recommendations).forEach((rec) => {
        const recEl = document.createElement("div");
        recEl.textContent = `• ${rec}`;
        recommendBox.appendChild(recEl);
      });

      if (viewInsightsBtn) viewInsightsBtn.disabled = false;

    } catch (err) {
      console.error("Analysis error:", err);
      recommendBox.innerText = `Error: ${err.message || err}`;
      boxes.forEach(b => b.innerText = "N/A");
    } finally {
      setLoading(false);
    }
  }

  // --- FOLLOW-UP QUESTION ---
  async function sendFollowUp() {
    const question = questionInput?.value?.trim();
    if (!question) {
      alert("Please enter a question to send.");
      return;
    }

    const conversation_id = (lastResult && lastResult.conversation_id)
      || localStorage.getItem("lcaConversationId")
      || (JSON.parse(localStorage.getItem("lcaResults") || "{}").output || {}).conversation_id;

    if (!conversation_id) {
      alert("Please run a new analysis first.");
      return;
    }

    const role = localStorage.getItem("userRole") || "sustainability manager";

    setLoading(true, true);

    // Show user question in chat
    const qEl = document.createElement("div");
    qEl.innerHTML = `<strong>You:</strong> ${question}`;
    recommendBox.appendChild(qEl);

    const aEl = document.createElement("div");
    aEl.innerHTML = "<em>AI is thinking...</em>";
    recommendBox.appendChild(aEl);

    try {
      const res = await fetch(`${API_BASE}/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id, question, role })
      });

      const json = await res.json().catch(async () => {
        const txt = await res.text();
        throw new Error("Invalid JSON from server: " + txt);
      });

      if (!res.ok) throw new Error(json.error || `Server returned ${res.status}`);

      const answer = json.answer || "No answer returned.";
      aEl.innerHTML = `<strong>AI:</strong> ${answer}`;

      // Save follow-ups in localStorage
      try {
        const store = JSON.parse(localStorage.getItem("lcaResults") || "{}");
        if (!store.output) store.output = {};
        if (!store.output.followups) store.output.followups = [];
        store.output.followups.push({ question, answer, conversation_id });
        localStorage.setItem("lcaResults", JSON.stringify(store));
      } catch (e) {}

      questionInput.value = "";
      recommendBox.scrollTop = recommendBox.scrollHeight;

    } catch (err) {
      console.error("Follow-up error:", err);
      aEl.innerHTML = `<strong>AI Error:</strong> ${err.message}`;
    } finally {
      setLoading(false);
    }
  }

  // --- Wire UI events ---
  if (runBtn) runBtn.addEventListener("click", runAnalysis);
  if (questionBtn) questionBtn.addEventListener("click", sendFollowUp);
  if (questionInput) {
    questionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendFollowUp();
      }
    });
  }

  // Enable insights if results already exist
  try {
    const stored = JSON.parse(localStorage.getItem("lcaResults") || "null");
    if (stored && stored.output && stored.output.conversation_id && viewInsightsBtn) {
      viewInsightsBtn.disabled = false;
    }
  } catch (e) {}
});
