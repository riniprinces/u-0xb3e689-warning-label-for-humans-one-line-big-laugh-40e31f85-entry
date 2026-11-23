// Warning Label for Humans — entry program.
//
// What it does: load the one-line warning label from entry.txt, which
// lives beside this file, make sure it would pass the competition's
// sealed gate (exactly one line, between 1 and 160 characters, valid
// UTF-8, more than blank space), print it to stdout, and — when the
// grader sets MAKEFUN_OUTPUT_DIR — drop a copy at
// $MAKEFUN_OUTPUT_DIR/entry.txt so the judge can read it.
//
// Paths are always built from import.meta.url. The program must work no
// matter which directory the grader starts it from, so process.cwd()
// is never consulted for locating the entry.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LIMIT = 160;
const OUTPUT_NAME = "entry.txt";

const folder = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(folder, OUTPUT_NAME);

function abort(reason: string): never {
  console.error(`error: ${reason}`);
  process.exit(1);
}

function loadEntry(): string {
  let bytes: Buffer;
  try {
    bytes = readFileSync(sourcePath);
  } catch {
    abort(`could not read ${sourcePath}`);
  }

  // Strict decoding: a malformed byte sequence must fail the run,
  // not quietly turn into a replacement character.
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes!);
  } catch {
    abort("entry.txt is not valid UTF-8 text");
  }

  // Normalise line endings, then drop a single trailing newline:
  // that newline belongs to the file, not to the label itself.
  return decoded.replace(/\r\n?/g, "\n").replace(/\n$/, "");
}

function checkGate(label: string): void {
  if (label.trim() === "") {
    abort("the entry is empty or only whitespace");
  }
  if (label.indexOf("\n") !== -1) {
    abort("the entry must be exactly one line");
  }
  const size = [...label].length;
  if (size > LIMIT) {
    abort(`the entry is ${size} characters, above the ${LIMIT} limit`);
  }
}

const label = loadEntry();
checkGate(label);
console.log(label);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (outputDir !== undefined && outputDir !== "") {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, OUTPUT_NAME), label, "utf8");
}
