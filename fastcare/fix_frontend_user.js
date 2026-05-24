const fs = require('fs');
const path = require('path');

const DIRS = [
  'src/app/(auth)',
  'src/app/patient',
  'src/app/doctor',
  'src/app/dashboard',
  'src/components/patient',
  'src/components/doctor',
  'src/components/shared',
];

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      callback(dirPath);
    }
  });
}

const REGEX_REPLACEMENTS = [
  // General colors
  [/\bbg-background\b/g, 'bg-[#0a0a0a]'],
  [/\bbg-surface\b(?!2)/g, 'bg-[#111111]'],
  [/\bbg-surface2\b/g, 'bg-[#1a1a1a]'],
  [/\bborder-border\b/g, 'border-[#1f2d1f]'],
  [/\btext-textprimary\b/g, 'text-[#f0fdf4]'],
  [/\btext-textmuted\b/g, 'text-[#6b7280]'],
  
  // Primary
  [/\bbg-primary\b(?!\/|-)/g, 'bg-green-600'],
  [/\bbg-primary-hover\b/g, 'hover:bg-green-700'],
  [/\bhover:bg-primary\/40\b/g, 'hover:bg-green-600/40'],
  [/\btext-primary\b/g, 'text-green-600'],
  [/\bborder-primary\b(?!\/)/g, 'border-green-600'],
  [/\bborder-primary\/(\d+)\b/g, 'border-green-600/$1'],
  [/\bbg-primary\/(\d+)\b/g, 'bg-green-600/$1'],
  [/\btext-accent\b/g, 'text-green-400'],
  
  // Alerts
  [/\btext-critical\b/g, 'text-red-500'],
  [/\bbg-critical\/(\d+)\b/g, 'bg-red-500/$1'],
  [/\bborder-critical\/(\d+)\b/g, 'border-red-500/20'], // specific request for border
  [/\bbg-red-500\/10 border-red-500\/30\b/g, 'bg-red-500/10 border border-red-500/20'],
  
  // Warnings
  [/\btext-warning\b/g, 'text-amber-500'],
  [/\bbg-warning\/(\d+)\b/g, 'bg-amber-500/$1'],
  [/\bborder-warning\/(\d+)\b/g, 'border-amber-500/20'],

  // Success
  [/\btext-success\b/g, 'text-green-500'],
  [/\bbg-success\/(\d+)\b/g, 'bg-green-500/$1'],
  [/\bborder-success\/(\d+)\b/g, 'border-green-500/20'],
  
  // Inputs
  [/\bfocus:border-primary\b/g, 'focus:border-green-600'],

  // Glows / Shadows
  [/\bglow-green\b/g, 'shadow-[0_0_20px_rgba(22,163,74,0.1)]'],
  [/\bcard-hover\b/g, 'hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition'],

  // White text / bg
  [/\bbg-white\b/g, 'bg-[#f0fdf4]'],
  [/\btext-white\b/g, 'text-[#f0fdf4]'],
  [/\border-white\b/g, 'border-[#f0fdf4]'],
];

DIRS.forEach(dir => {
  walkDir(dir, filePath => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Apply regex replacements
    REGEX_REPLACEMENTS.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    // Special card rule: Every card gets hover:border-green-800 hover:shadow...
    // If it has bg-[#111111] and border-[#1f2d1f], it's likely a card
    content = content.replace(/bg-\[#111111\]\s*(.*?)border-\[#1f2d1f\]/g, (match, middle) => {
      if (!match.includes('hover:border-green-800')) {
        return `${match} hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  });
});
