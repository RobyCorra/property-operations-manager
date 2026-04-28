export const DEFAULT_CHECKLIST = [
  { label: "Sistemazione letti", required: true, type: "static" },
  { label: "Asciugamani", required: true, type: "dynamic", formula: "guests * 2" },
  { label: "Pulizia bagno", required: true, type: "static" },
  { label: "Pulizia cucina", required: true, type: "static" },
  { label: "Carta igienica", required: true, type: "dynamic", formula: "bathrooms * 2" },
  { label: "Caffè / Capsule", required: false, type: "dynamic", formula: "guests + 2" },
  { label: "Rimozione spazzatura", required: true, type: "static" },
  { label: "Controllo telecomandi", required: false, type: "static" },
  { label: "Controllo Wi-Fi", required: false, type: "static" },
  { label: "Lavaggio pavimenti", required: true, type: "static" },
];
