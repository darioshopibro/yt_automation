// Test raznih icon library-ja

console.log("=== TESTING ICON LIBRARIES ===\n");

// 1. LUCIDE
console.log("1. LUCIDE-REACT:");
const lucide = require("lucide-react");
console.log("   Total exports:", Object.keys(lucide).length);
console.log("   TextCursorInput:", !!lucide.TextCursorInput);
console.log("   Type:", typeof lucide.TextCursorInput);

// 2. REACT-ICONS (Feather)
console.log("\n2. REACT-ICONS (Feather):");
const fi = require("react-icons/fi");
console.log("   Total Feather:", Object.keys(fi).length);
console.log("   FiVideo:", !!fi.FiVideo);
console.log("   FiDatabase:", !!fi.FiDatabase);
console.log("   Type:", typeof fi.FiVideo);

// 3. REACT-ICONS (Heroicons)
console.log("\n3. REACT-ICONS (Heroicons):");
const hi = require("react-icons/hi");
console.log("   Total Heroicons:", Object.keys(hi).length);

// 4. ICONIFY
console.log("\n4. ICONIFY:");
const iconify = require("@iconify/react");
console.log("   Icon component:", !!iconify.Icon);
console.log("   Type:", typeof iconify.Icon);

// Test rendering
console.log("\n=== COMPONENT TEST ===");
const React = require("react");

// Lucide component check
if (lucide.Video) {
  console.log("Lucide Video is:", lucide.Video.$$typeof ? "ForwardRef Component" : "Unknown");
}

// React-icons component check  
if (fi.FiVideo) {
  console.log("FiVideo is:", fi.FiVideo.$$typeof ? "ForwardRef Component" : typeof fi.FiVideo);
}
