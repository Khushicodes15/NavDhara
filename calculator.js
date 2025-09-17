// document.addEventListener("DOMContentLoaded", function() {
//   const runBtn = document.querySelector(".left .btn");
//   const boxes = document.querySelectorAll(".preview-boxes .box");
//   const recommendBox = document.querySelector(".recommendation-box");

//   // Update recycling rate slider display
//   const slider = document.getElementById("recycling_rate");
//   const output = document.getElementById("recycling_rate_val");
//   if (slider && output) {
//     output.innerText = slider.value;
//     slider.addEventListener("input", function() {
//       output.innerText = this.value;
//     });
//   }

//   // Helper function: Validate a number string strictly
//   function isValidNumber(value) {
//     return /^-?\d+(\.\d+)?$/.test(value.trim());
//   }

//   runBtn.addEventListener("click", async () => {
//     // Collect raw string input values
//     const materialType = document.getElementById("material_type").value;
//     const scrapRaw = document.getElementById("scrap_kg").value;
//     const costRaw = document.getElementById("cost_usd_per_kg").value;
//     const co2Raw = document.getElementById("co2_kg_per_kg").value;
//     const transportRaw = document.getElementById("transport_km").value;
//     const recyclingRaw = document.getElementById("recycling_rate").value;
//     const smeltingRaw = document.getElementById("smelting_energy").value;
//     const miningRaw = document.getElementById("mining_energy").value;
//     const waterRaw = document.getElementById("water_usage_l_per_kg").value;

//     // Validate materialType
//     if (materialType === "Select Material") {
//       alert("Please select a valid Material Type.");
//       return;
//     }

//     // Validate numeric inputs strictly
//     const numberFields = {
//       "Scrap available": scrapRaw,
//       "Production cost": costRaw,
//       "CO2": co2Raw,
//       "Transport Distance": transportRaw,
//       "Recycling rate": recyclingRaw,
//       "Smelting energy": smeltingRaw,
//       "Mining energy": miningRaw,
//       "Water usage": waterRaw
//     };

//     for (const [name, val] of Object.entries(numberFields)) {
//       if (!isValidNumber(val)) {
//         alert(`Please enter a valid number for ${name}.`);
//         return;
//       }
//     }

//     // Prepare data with keys exactly matching backend expectations
//     const data = {
//       material: materialType,
//       scrap_available: parseFloat(scrapRaw),
//       production_cost_usd_per_kg: parseFloat(costRaw),
//       co2_kg_per_kg: parseFloat(co2Raw),
//       transport_km: parseFloat(transportRaw),
//       recycling_rate: parseFloat(recyclingRaw) / 100, // convert percentage to decimal
//       smelting_energy_mj_per_kg: parseFloat(smeltingRaw),
//       mining_energy_mj_per_kg: parseFloat(miningRaw),
//       water_usage_l_per_kg: parseFloat(waterRaw)
//     };

//     // Show loading state in UI
//     boxes.forEach(box => (box.innerText = "Loading..."));
//     recommendBox.innerText = "Loading...";

//     try {
//       const response = await fetch("https://lca-backend-1i20.onrender.com/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//       });

//       console.log("Response status:", response.status);

//       const text = await response.text();
//       console.log("Response text:", text);

//       let result;
//       try {
//         result = JSON.parse(text);
//       } catch (e) {
//         console.error("Failed to parse JSON:", e);
//         throw new Error("Server returned invalid JSON");
//       }

//       if (!response.ok) {
//         throw new Error(result.error || `Error ${response.status}`);
//       }

//       // Display the results
//       boxes[0].innerText =
//         result.impact_score !== undefined ? result.impact_score.toFixed(2) : "N/A";
//       boxes[1].innerText = result.impact_level || "N/A";
//       boxes[2].innerText = result.top_factors
//         ? Object.entries(result.top_factors).map(([k, v]) => `${k}: ${v}%`).join(", ")
//         : "N/A";

//       recommendBox.innerText = result.recommendations?.length
//         ? result.recommendations.join("\n")
//         : "No recommendations";

//     } catch (error) {
//       console.error("Fetch or API error:", error);
//       recommendBox.innerText = `Error fetching data! ${error.message || ""}`;
//       boxes.forEach(box => (box.innerText = "N/A"));
//     }
//   });
// });



document.addEventListener("DOMContentLoaded", function() {
  const runBtn = document.querySelector(".left .btn");
  const boxes = document.querySelectorAll(".preview-boxes .box");
  const recommendBox = document.querySelector(".recommendation-box");

  const viewInsightsBtn = document.querySelector(".right .btn"); // ✅ Select Insights button

  // Initially disable "View Full Insights"
  if (viewInsightsBtn) viewInsightsBtn.disabled = true;

  // Update recycling rate slider display
  const slider = document.getElementById("recycling_rate");
  const output = document.getElementById("recycling_rate_val");
  if (slider && output) {
    output.innerText = slider.value;
    slider.addEventListener("input", function() {
      output.innerText = this.value;
    });
  }

  // Helper function: Validate a number string strictly
  function isValidNumber(value) {
    return /^-?\d+(\.\d+)?$/.test(value.trim());
  }

  // Helper function: Adjust font size to fit text inside box without overflow
  function fitTextToBox(box) {
    const MAX_FONT_SIZE = 20; // max font size in px
    const MIN_FONT_SIZE = 8;  // min font size in px
    let fontSize = MAX_FONT_SIZE;

    box.style.fontSize = fontSize + "px";
    box.style.whiteSpace = "nowrap";

    while (box.scrollWidth > box.clientWidth && fontSize > MIN_FONT_SIZE) {
      fontSize -= 1;
      box.style.fontSize = fontSize + "px";
    }

    box.style.whiteSpace = "normal"; // allow wrapping if needed after shrinking
  }

  runBtn.addEventListener("click", async () => {
    // Collect raw string input values
    const materialType = document.getElementById("material_type").value;
    const scrapRaw = document.getElementById("scrap_kg").value;
    const costRaw = document.getElementById("cost_usd_per_kg").value;
    const co2Raw = document.getElementById("co2_kg_per_kg").value;
    const transportRaw = document.getElementById("transport_km").value;
    const recyclingRaw = document.getElementById("recycling_rate").value;
    const smeltingRaw = document.getElementById("smelting_energy").value;
    const miningRaw = document.getElementById("mining_energy").value;
    const waterRaw = document.getElementById("water_usage_l_per_kg").value;

    // Validate materialType
    if (materialType === "Select Material") {
      alert("Please select a valid Material Type.");
      return;
    }

    // Validate numeric inputs strictly
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
      if (!isValidNumber(val)) {
        alert(`Please enter a valid number for ${name}.`);
        return;
      }
    }

    // Prepare data with keys exactly matching backend expectations
    const data = {
      material: materialType,
      scrap_available: parseFloat(scrapRaw),
      production_cost_usd_per_kg: parseFloat(costRaw),
      co2_kg_per_kg: parseFloat(co2Raw),
      transport_km: parseFloat(transportRaw),
      recycling_rate: parseFloat(recyclingRaw) / 100, // convert percentage to decimal
      smelting_energy_mj_per_kg: parseFloat(smeltingRaw),
      mining_energy_mj_per_kg: parseFloat(miningRaw),
      water_usage_l_per_kg: parseFloat(waterRaw)
    };

    // Show loading state in UI
    boxes.forEach(box => (box.innerText = "Loading..."));
    recommendBox.innerText = "Loading...";

    try {
      const response = await fetch("https://lca-backend-1i20.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      console.log("Response status:", response.status);

      const text = await response.text();
      console.log("Response text:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Server returned invalid JSON");
      }

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Store inputs and output in localStorage for insights.html
      localStorage.setItem("lcaResults", JSON.stringify({ inputs: data, output: result }));
    
      boxes[0].innerText =
        result.impact_score !== undefined ? result.impact_score.toFixed(2) : "N/A";
      boxes[0].style.fontSize = "1.6rem";

      boxes[1].innerText = result.impact_level || "N/A";
      boxes[1].style.fontSize = "1.4rem";

      boxes[2].innerText = result.top_factors
        ? Object.entries(result.top_factors).map(([k, v]) => `${k}: ${v}%`).join(", ")
        : "N/A";
      boxes[2].style.fontSize = "1.1rem";

      recommendBox.innerText = result.recommendations?.length
        ? result.recommendations.join("\n")
        : "No recommendations";

      if (viewInsightsBtn) {
        viewInsightsBtn.disabled = false;
        viewInsightsBtn.addEventListener("click", () => {
          window.location.href = "insights.html";  // Fixed to match your HTML file
        });
      }

    } catch (error) {
      console.error("Fetch or API error:", error);
      recommendBox.innerText = `Error fetching data! ${error.message || ""}`;
      boxes.forEach(box => (box.innerText = "N/A"));
    }
  });
});


