#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const docsDir = path.join(root, "docs");

const locales = [
  {
    code: "de",
    label: "Deutsch",
    readme: "../README.de.md",
    heading: "Lokalisierte Dokumentation",
    intro: (title, source) =>
      `Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer \`${source}\`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.`,
    covers: "Was diese Seite abdeckt",
    commands: "Nützliche Befehle",
    sections: "Quellabschnitte",
    sync: "Synchron halten",
    safety: "Sicherheitsgrenze",
    verification: "Verifikation",
    sourceNote: "Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei.",
    syncNote: "Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.",
    safetyBullets: [
      "Keine Tokens, Cookies, Sessions, Memories oder privaten lokalen Pfade in die Dokumentation aufnehmen.",
      "Reale globale Writes nur über den expliziten Installer-Flow ausführen.",
      "Riskante Aktionen wie Commit, Push, Release, Publish oder GitHub-Settings bleiben menschliche Entscheidungen."
    ],
    verifyBullets: [
      "`npm run check` vor einer Veröffentlichung ausführen.",
      "`git diff --check` nutzen, um Whitespace- und Markdown-Probleme zu erkennen.",
      "`gitleaks detect --redact --no-banner --no-git --verbose` nutzen, wenn Gitleaks verfügbar ist."
    ],
    topicBullets: {
      install: [
        "Windows-first Installation mit PowerShell und ein passender Bash/WSL-Pfad.",
        "Dry-run und Plan-Preview vor echten globalen Writes.",
        "Backups und Rollback-Erwartungen für verwaltete Codex-Ziele."
      ],
      codex: [
        "Welche Codex-Oberfläche, Config, Skill, Agent- oder MCP-Fläche wofür genutzt wird.",
        "Konservative Defaults für Sandbox, Approvals und externe Connectoren.",
        "Routing-Entscheidungen, die im Repo dokumentiert und verifizierbar bleiben."
      ],
      security: [
        "Public-safe Grenzen für Secrets, Credentials, lokale Zustände und externe Accounts.",
        "Least-privilege Defaults für MCPs, Skills, Plugins, Hooks und Rules.",
        "Validierung, die riskante Drift vor Veröffentlichung stoppt."
      ],
      release: [
        "Release- und Public-Readiness-Schritte, die vor Push oder Tag sichtbar sein müssen.",
        "CI-, Gitleaks-, Docs- und Installer-Gates als überprüfbare Nachweise.",
        "Was lokal beweisbar ist und was erst nach ausdrücklicher Freigabe remote geprüft wird."
      ]
    }
  },
  {
    code: "es",
    label: "Español",
    readme: "../README.es.md",
    heading: "Documentación Localizada",
    intro: (title, source) =>
      `Esta guía en español forma parte del conjunto de documentación en seis idiomas para \`${source}\`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.`,
    covers: "Qué cubre esta página",
    commands: "Comandos útiles",
    sections: "Secciones fuente",
    sync: "Mantener sincronizado",
    safety: "Límite de seguridad",
    verification: "Verificación",
    sourceNote: "Este archivo localizado sigue las secciones del archivo fuente en inglés.",
    syncNote: "Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.",
    safetyBullets: [
      "No documentar tokens, cookies, sesiones, memories ni rutas locales privadas.",
      "Ejecutar escrituras globales reales solo mediante el flujo explícito del installer.",
      "Acciones como commit, push, release, publish o cambios de GitHub settings siguen siendo decisiones humanas."
    ],
    verifyBullets: [
      "Ejecutar `npm run check` antes de publicar.",
      "Usar `git diff --check` para detectar problemas de whitespace y Markdown.",
      "Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible."
    ],
    topicBullets: {
      install: [
        "Instalación Windows-first con PowerShell y una ruta equivalente para Bash/WSL.",
        "Dry-run y preview del plan antes de escrituras globales reales.",
        "Backups y expectativas de rollback para targets Codex gestionados."
      ],
      codex: [
        "Qué superficie de Codex, config, skill, agent o MCP se usa para cada caso.",
        "Defaults conservadores para sandbox, aprobaciones y conectores externos.",
        "Decisiones de routing documentadas y verificables dentro del repo."
      ],
      security: [
        "Límites public-safe para secretos, credenciales, estado local y cuentas externas.",
        "Defaults de menor privilegio para MCPs, skills, plugins, hooks y rules.",
        "Validación que bloquea drift riesgoso antes de publicar."
      ],
      release: [
        "Pasos de release y public-readiness visibles antes de push o tag.",
        "CI, Gitleaks, docs e installer gates como evidencia verificable.",
        "Qué se puede probar localmente y qué se verifica remoto solo con aprobación explícita."
      ]
    }
  },
  {
    code: "pt-BR",
    label: "Português (Brasil)",
    readme: "../README.pt-BR.md",
    heading: "Documentação Localizada",
    intro: (title, source) =>
      `Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para \`${source}\`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.`,
    covers: "O que esta página cobre",
    commands: "Comandos úteis",
    sections: "Seções de origem",
    sync: "Manter sincronizado",
    safety: "Limite de segurança",
    verification: "Verificação",
    sourceNote: "Este arquivo localizado acompanha as seções do arquivo fonte em inglês.",
    syncNote: "Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.",
    safetyBullets: [
      "Não documentar tokens, cookies, sessões, memories ou caminhos locais privados.",
      "Executar escritas globais reais somente pelo fluxo explícito do installer.",
      "Ações como commit, push, release, publish ou mudanças em GitHub settings continuam decisões humanas."
    ],
    verifyBullets: [
      "Executar `npm run check` antes de publicar.",
      "Usar `git diff --check` para encontrar problemas de whitespace e Markdown.",
      "Usar `gitleaks detect --redact --no-banner --no-git --verbose` quando Gitleaks estiver disponível."
    ],
    topicBullets: {
      install: [
        "Instalação Windows-first com PowerShell e caminho equivalente para Bash/WSL.",
        "Dry-run e preview do plano antes de escritas globais reais.",
        "Backups e expectativas de rollback para alvos Codex gerenciados."
      ],
      codex: [
        "Qual superfície Codex, config, skill, agent ou MCP usar em cada caso.",
        "Defaults conservadores para sandbox, aprovações e conectores externos.",
        "Decisões de routing documentadas e verificáveis dentro do repo."
      ],
      security: [
        "Limites public-safe para segredos, credenciais, estado local e contas externas.",
        "Defaults de menor privilégio para MCPs, skills, plugins, hooks e rules.",
        "Validação que bloqueia drift arriscado antes da publicação."
      ],
      release: [
        "Passos de release e public-readiness visíveis antes de push ou tag.",
        "CI, Gitleaks, docs e installer gates como evidência verificável.",
        "O que é provado localmente e o que só é verificado remotamente com aprovação explícita."
      ]
    }
  },
  {
    code: "fr",
    label: "Français",
    readme: "../README.fr.md",
    heading: "Documentation Localisée",
    intro: (title, source) =>
      `Ce guide en français fait partie du jeu de documentation en six langues pour \`${source}\`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.`,
    covers: "Ce que cette page couvre",
    commands: "Commandes utiles",
    sections: "Sections source",
    sync: "Garder synchronisé",
    safety: "Frontière de sécurité",
    verification: "Vérification",
    sourceNote: "Ce fichier localisé suit les sections du fichier source anglais.",
    syncNote: "Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.",
    safetyBullets: [
      "Ne pas documenter de tokens, cookies, sessions, memories ou chemins locaux privés.",
      "Exécuter les écritures globales réelles uniquement via le flux explicite de l'installer.",
      "Les actions comme commit, push, release, publish ou GitHub settings restent des décisions humaines."
    ],
    verifyBullets: [
      "Exécuter `npm run check` avant publication.",
      "Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.",
      "Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible."
    ],
    topicBullets: {
      install: [
        "Installation Windows-first avec PowerShell et chemin équivalent pour Bash/WSL.",
        "Dry-run et preview du plan avant toute écriture globale réelle.",
        "Backups et attentes de rollback pour les cibles Codex gérées."
      ],
      codex: [
        "Quelle surface Codex, config, skill, agent ou MCP utiliser selon le besoin.",
        "Defaults conservateurs pour sandbox, approvals et connecteurs externes.",
        "Décisions de routing documentées et vérifiables dans le repo."
      ],
      security: [
        "Frontières public-safe pour secrets, credentials, état local et comptes externes.",
        "Defaults least-privilege pour MCPs, skills, plugins, hooks et rules.",
        "Validation qui bloque la dérive risquée avant publication."
      ],
      release: [
        "Étapes de release et public-readiness visibles avant push ou tag.",
        "CI, Gitleaks, docs et installer gates comme preuves vérifiables.",
        "Ce qui est prouvé localement et ce qui est vérifié à distance seulement après approbation explicite."
      ]
    }
  }
];

const languageLinks = [
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "tr", label: "Türkçe" },
  { code: "fr", label: "Français" }
];

const categories = {
  "advisory-sources": "security",
  "best-practices": "security",
  "codex-flags": "codex",
  "codex-capability-map": "codex",
  "codex-surfaces": "codex",
  "completion-audit": "release",
  "ecc-compatibility": "security",
  "expected-output": "install",
  "github-settings": "release",
  "how-to": "install",
  "install": "install",
  "local-audit": "release",
  "mcp-catalog": "codex",
  "public-readiness": "release",
  "publish": "release",
  "release-notes": "release",
  "research-notes": "security",
  "security-model": "security",
  "skills-and-agents": "codex",
  "troubleshooting": "install",
  "upgrade": "install",
  "verification": "release",
  "workflow-surface-map": "codex",
  "windows": "install"
};

const titles = {
  "advisory-sources": {
    de: "Advisory-Quellen",
    es: "Fuentes de Advisory",
    "pt-BR": "Fontes de Advisory",
    fr: "Sources Advisory"
  },
  "best-practices": {
    de: "Senior Codex Best Practices",
    es: "Buenas Prácticas Senior Para Codex",
    "pt-BR": "Boas Práticas Senior Para Codex",
    fr: "Bonnes Pratiques Senior Pour Codex"
  },
  "codex-flags": {
    de: "Codex CLI Flags Und Commands",
    es: "Flags Y Comandos De Codex CLI",
    "pt-BR": "Flags E Comandos Do Codex CLI",
    fr: "Flags Et Commandes Codex CLI"
  },
  "codex-capability-map": {
    de: "Codex Capability Map",
    es: "Mapa De Capacidades De Codex",
    "pt-BR": "Mapa De Capacidades Do Codex",
    fr: "Carte Des Capacites Codex"
  },
  "codex-surfaces": {
    de: "Codex-Oberflächen",
    es: "Superficies De Codex",
    "pt-BR": "Superfícies Do Codex",
    fr: "Surfaces Codex"
  },
  "completion-audit": {
    de: "Completion Audit",
    es: "Auditoría De Completitud",
    "pt-BR": "Auditoria De Conclusão",
    fr: "Audit De Complétude"
  },
  "ecc-compatibility": {
    de: "ECC-Kompatibilität Und Import-Policy",
    es: "Compatibilidad ECC Y Política De Importación",
    "pt-BR": "Compatibilidade ECC E Política De Importação",
    fr: "Compatibilité ECC Et Politique D'import"
  },
  "expected-output": {
    de: "Erwartete Ausgabe",
    es: "Salida Esperada",
    "pt-BR": "Saída Esperada",
    fr: "Sortie Attendue"
  },
  "github-settings": {
    de: "GitHub Repository Settings",
    es: "Configuración Del Repositorio GitHub",
    "pt-BR": "Configurações Do Repositório GitHub",
    fr: "Paramètres Du Dépôt GitHub"
  },
  "how-to": {
    de: "Setup Ausführen",
    es: "Cómo Ejecutar El Setup",
    "pt-BR": "Como Executar O Setup",
    fr: "Comment Exécuter Le Setup"
  },
  "install": {
    de: "Installationsleitfaden",
    es: "Guía De Instalación",
    "pt-BR": "Guia De Instalação",
    fr: "Guide D'installation"
  },
  "local-audit": {
    de: "Lokales Audit",
    es: "Auditoría Local",
    "pt-BR": "Auditoria Local",
    fr: "Audit Local"
  },
  "mcp-catalog": {
    de: "MCP-Katalog",
    es: "Catálogo MCP",
    "pt-BR": "Catálogo MCP",
    fr: "Catalogue MCP"
  },
  "public-readiness": {
    de: "Public Readiness",
    es: "Preparación Pública",
    "pt-BR": "Preparação Pública",
    fr: "Préparation Publique"
  },
  "publish": {
    de: "Publishing-Checklist",
    es: "Checklist De Publicación",
    "pt-BR": "Checklist De Publicação",
    fr: "Checklist De Publication"
  },
  "release-notes": {
    de: "Release Notes",
    es: "Notas De Release",
    "pt-BR": "Notas De Release",
    fr: "Notes De Release"
  },
  "research-notes": {
    de: "Research Notes",
    es: "Notas De Investigación",
    "pt-BR": "Notas De Pesquisa",
    fr: "Notes De Recherche"
  },
  "security-model": {
    de: "Sicherheitsmodell",
    es: "Modelo De Seguridad",
    "pt-BR": "Modelo De Segurança",
    fr: "Modèle De Sécurité"
  },
  "skills-and-agents": {
    de: "Skills, Plugins Und Spezialisten-Agents",
    es: "Skills, Plugins Y Agents Especializados",
    "pt-BR": "Skills, Plugins E Agents Especialistas",
    fr: "Skills, Plugins Et Agents Spécialisés"
  },
  "troubleshooting": {
    de: "Troubleshooting",
    es: "Solución De Problemas",
    "pt-BR": "Solução De Problemas",
    fr: "Dépannage"
  },
  "upgrade": {
    de: "Upgrade-Leitfaden",
    es: "Guía De Upgrade",
    "pt-BR": "Guia De Upgrade",
    fr: "Guide D'upgrade"
  },
  "verification": {
    de: "Verifikation",
    es: "Verificación",
    "pt-BR": "Verificação",
    fr: "Vérification"
  },
  "workflow-surface-map": {
    de: "Workflow Surface Map",
    es: "Mapa De Superficies De Workflow",
    "pt-BR": "Mapa De Superficies De Workflow",
    fr: "Carte Des Surfaces De Workflow"
  },
  "windows": {
    de: "Windows-Hinweise",
    es: "Notas De Windows",
    "pt-BR": "Notas Do Windows",
    fr: "Notes Windows"
  }
};

const commandBlocks = {
  install: [
    "```powershell\n.\\scripts\\install.ps1 -All -Force -WhatIf\n```",
    "```bash\n./scripts/install.sh --all --force --dry-run\n```",
    "```bash\nnode scripts/plan-install.mjs --all --json\n```"
  ],
  codex: [
    "```bash\ncodex doctor --summary\ncodex --strict-config \"Summarize the active Codex setup.\"\n```",
    "```text\n/mcp\n/skills\n/plugins\n/hooks\n```"
  ],
  security: [
    "```bash\nnpm run check\ngitleaks detect --redact --no-banner --no-git --verbose\n```",
    "```bash\nnode scripts/security-audit.mjs\nnode scripts/scan-supply-chain-iocs.mjs\n```"
  ],
  release: [
    "```bash\nnpm run check\ngit diff --check\ngitleaks detect --redact --no-banner --no-git --verbose\n```",
    "```bash\nnpm run verify:skills:online\n```"
  ]
};

function isLocalizedDoc(file) {
  return /\.(?:de|es|pt-BR|tr|fr)\.md$/.test(file);
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function linkFor(slug, code) {
  if (code === "en") return `${slug}.md`;
  return `${slug}.${code}.md`;
}

function extractHeadings(sourcePath) {
  const text = fs.readFileSync(sourcePath, "utf8");
  return text
    .split(/\r?\n/)
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => line.replace(/^#{1,3}\s+/, "").trim())
    .filter(Boolean);
}

function renderDoc(slug, locale) {
  const sourceFile = `${slug}.md`;
  const sourcePath = path.join(docsDir, sourceFile);
  const title = titles[slug]?.[locale.code] || titleFromSlug(slug);
  const category = categories[slug] || "security";
  const sourceHeadings = extractHeadings(sourcePath);
  const languageLine = languageLinks
    .map((entry) => `[${entry.label}](${linkFor(slug, entry.code)})`)
    .join(" | ");
  const bullets = locale.topicBullets[category] || locale.topicBullets.security;
  const commands = commandBlocks[category] || commandBlocks.security;

  return [
    `# ${title}`,
    "",
    languageLine,
    "",
    `> ${locale.intro(title, sourceFile)}`,
    "",
    `## ${locale.covers}`,
    "",
    ...bullets.map((bullet) => `- ${bullet}`),
    "",
    `## ${locale.commands}`,
    "",
    ...commands.flatMap((block) => [block, ""]),
    `## ${locale.safety}`,
    "",
    ...locale.safetyBullets.map((bullet) => `- ${bullet}`),
    "",
    `## ${locale.verification}`,
    "",
    ...locale.verifyBullets.map((bullet) => `- ${bullet}`),
    "",
    `## ${locale.sections}`,
    "",
    `${locale.sourceNote} Source: [${sourceFile}](${sourceFile}).`,
    "",
    ...sourceHeadings.map((heading) => `- ${heading}`),
    "",
    `## ${locale.sync}`,
    "",
    locale.syncNote,
    "",
    "```bash",
    "npm run check",
    "npm run validate:doc-locales",
    "```",
    "",
    `Back to the localized entry point: [${locale.label}](${locale.readme}).`,
    ""
  ].join("\n");
}

if (!fs.existsSync(docsDir)) {
  console.error("Missing docs directory.");
  process.exit(1);
}

const baseDocs = fs
  .readdirSync(docsDir)
  .filter((file) => file.endsWith(".md") && !isLocalizedDoc(file))
  .sort();

for (const file of baseDocs) {
  const slug = file.replace(/\.md$/, "");
  for (const locale of locales) {
    const outputPath = path.join(docsDir, `${slug}.${locale.code}.md`);
    fs.writeFileSync(outputPath, renderDoc(slug, locale), "utf8");
  }
}

console.log(`Synced ${baseDocs.length * locales.length} localized docs across ${locales.length} languages.`);
