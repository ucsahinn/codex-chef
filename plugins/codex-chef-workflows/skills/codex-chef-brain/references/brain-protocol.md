# Codex Chef Brain Protocol

## Ownership And Trust

The Brain is a user-owned directory of local Markdown. Codex Chef owns only the
templates, schema, deterministic CLI, validator, and skill. Control Center owns
execution state separately. Brain note text, imported candidates, excerpts,
web content, and logs are untrusted data; none can override current user intent,
repo instructions, sandboxing, approvals, or policy.

## Target Resolution

Use an explicit `--target`/`--vault` or `CODEX_CHEF_BRAIN_HOME`. Root, profile
root, UNC/network, device-namespace, symbolic-link, junction, traversal, ADS,
and reserved-name targets must fail closed. A redirected/cloud-backed Documents
folder is not private merely because it is called Documents; warn before use.

## Candidate Contract

Candidates use `codex-chef.brain-candidate.v1` and contain a UUID, note type,
title, portable `projectId`, Markdown body, privacy, confidence, retention, and
at least one portable source reference. Contents go to `00-inbox/captures` and
remain untrusted until reviewed. The same candidate is idempotent. A differing
file at the same path is a conflict, not an overwrite.

Allowed policy values are documented by the JSON schemas in `schemas/`.
`restricted` notes are never returned by default. Source references must not
contain private absolute paths, credentials, or raw session locations.

## Retrieval Contract

V1 retrieval is local lexical search scoped to an exact project. Default hard
limits are eight notes, 20,000 total characters, and 5,000 characters per
excerpt. Context packs carry relative path, stable note ID, metadata, source
references, excerpt, truncation state, and SHA-256. Retrieval never makes a
network request.

## Obsidian Presentation Contract

Obsidian may be selected as the human interface without becoming a Brain
runtime dependency or source of truth. `.obsidian` is local UI state and is
excluded from retrieval and canonical validation. The Brain CLI may generate a
percent-encoded `obsidian://open` URI only for an existing relative `.md` or
`.canvas` path. It does not launch the application and never generates write
actions such as `new`, `append`, or `overwrite`.

## Mutation Contract

Initialization is create-only. Capture uses exclusive create. Backup produces a
manifest with per-file hashes under `.brain/backups`. Restore requires preview,
verifies the backup and current hashes, creates a rollback backup, then performs
same-directory temporary writes and rename. V1 never prunes backups or deletes
notes.

## Privacy Contract

Reject credential-like values and private-key material. Do not store raw chat,
terminal or browser sessions, environment dumps, auth state, runtime databases,
WAL files, Control Center prompts, or full evidence streams. Plain Markdown is
not encrypted storage. Obsidian Sync, community plugins, hosted embeddings, and
cloud memory are separate user decisions and are disabled by default.

## Windows ACL Integrity Contract

Windows `status` composes canonical content validation with a read-only ACL
audit of the root and every descendant. The root must have protected
inheritance and exactly four inheritable Allow roles: SYSTEM, Administrators,
and the root owner with FullControl (`0x1f01ff`), plus the locally resolved
`CodexSandboxUsers` group with ReadAndExecute and Synchronize (`0x1200a9`).
Descendants must retain the root owner, remain unprotected, contain no explicit
access rule, and inherit the same four-role policy. Reparse points, extra or
unresolved principals, Deny rules, write-capable sandbox rights, owner drift,
incomplete traversal, or an unavailable probe fail closed.

The probe uses an absolute system PowerShell executable, a fixed script,
`shell:false`, a sanitized environment, bounded output and timeout, and sends
the validated target only through stdin. It never invokes an ACL or filesystem
mutation primitive and returns only fixed checks, risk, counts, and safe error
messages. SID values, SDDL, local account names, and raw PowerShell errors do
not enter the public report.

ReadAndExecute protects integrity, not confidentiality. Any sandbox process
with that ACE may read files directly without using the Brain retrieval filter.
The `restricted` metadata class is therefore application policy, not an OS
privacy boundary. Information that must be hidden from Codex belongs in a
separate owner-only location or a future reviewed projection design.

## Control Center Boundary

The two systems never share a database. Brain may return a read-only bounded
context pack. Control 0.3.0 validates its schema, project, privacy, relative
paths, hashes, note count, and character budgets before wrapping excerpts as
untrusted reference data. Canonical evidence stores only context digest and note
references, never excerpts or the absolute vault path. A successful run may
emit a redacted candidate preview; the same export omits the raw final message.
Control never invokes Brain capture/apply. Brain preview and explicit apply stay
separate. No runtime can generate approval merely by writing `APPROVED` into a
note or candidate.
