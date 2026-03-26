export interface ParsedVercelError {
  errorType: string;
  message: string;
  suggestedFix: string;
}

const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  errorType: string;
  fix: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /Cannot find module '([^']+)'/,
    errorType: "missing_module",
    fix: (m) => `Install missing dependency: npm install ${m[1]}`,
  },
  {
    pattern: /Module not found: Can't resolve '([^']+)'/,
    errorType: "missing_module",
    fix: (m) => `Install missing dependency: npm install ${m[1]}`,
  },
  {
    pattern: /Property '([^']+)' does not exist on type '([^']+)'/,
    errorType: "typescript_error",
    fix: (m) => `Add missing property '${m[1]}' to type '${m[2]}' or update type annotation`,
  },
  {
    pattern: /Type '([^']+)' is not assignable to type '([^']+)'/,
    errorType: "typescript_error",
    fix: () => "Fix type mismatch — check the component props and their expected types",
  },
  {
    pattern: /Expected (\d+) arguments?, but got (\d+)/,
    errorType: "typescript_error",
    fix: (m) => `Function called with wrong number of arguments (expected ${m[1]}, got ${m[2]})`,
  },
  {
    pattern: /SyntaxError: Unexpected token/,
    errorType: "syntax_error",
    fix: () => "Fix syntax error — check for missing brackets, commas, or invalid JSX",
  },
  {
    pattern: /ENOSPC: no space left/i,
    errorType: "disk_space",
    fix: () => "Build artifacts too large. Clean .next cache and reduce bundle size",
  },
  {
    pattern: /Build exceeded maximum duration/i,
    errorType: "timeout",
    fix: () => "Build taking too long. Try simplifying heavy components or reducing dependencies",
  },
  {
    pattern: /Timeout waiting for deployment/i,
    errorType: "timeout",
    fix: () => "Deployment timed out. Retry or simplify Hero.tsx and large components",
  },
  {
    pattern: /NEXT_PUBLIC_([A-Z_]+).*is not defined/,
    errorType: "missing_env",
    fix: (m) => `Add missing environment variable NEXT_PUBLIC_${m[1]} to Vercel project settings`,
  },
  {
    pattern: /process\.env\.([A-Z_]+).*undefined/,
    errorType: "missing_env",
    fix: (m) => `Add missing environment variable ${m[1]} to Vercel project settings`,
  },
  {
    pattern: /out of memory/i,
    errorType: "memory",
    fix: () => "Build ran out of memory. Reduce image sizes or split large components",
  },
  {
    pattern: /Error: ([^\n]{10,100})/,
    errorType: "runtime_error",
    fix: (m) => `Runtime error: "${m[1]}" — check browser console and server logs`,
  },
];

export function parseVercelError(buildLogs: string): ParsedVercelError {
  for (const { pattern, errorType, fix } of ERROR_PATTERNS) {
    const match = buildLogs.match(pattern);
    if (match) {
      return {
        errorType,
        message: match[0],
        suggestedFix: fix(match),
      };
    }
  }

  // Extract first meaningful error line
  const errorLine = buildLogs
    .split("\n")
    .find((line) => /error|Error|FAILED|failed/i.test(line))
    ?.trim();

  return {
    errorType: "unknown",
    message: errorLine ?? "Unknown build error",
    suggestedFix: "Check full build logs in Vercel dashboard for details",
  };
}
