const EXECUTOR_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface TestCase {
  input: string
  expected: string
}

interface ExecutionResult {
  id: string
  status: "OK" | "TLE" | "MLE" | "RE" | "ERR"
  stdout: string
  stderr: string
  execTime: number
}

export interface JudgedResult {
  testCase: number
  passed: boolean
  status: ExecutionResult["status"]
  execTime: number
  yourOutput: string
  expected: string
}

export async function runBatch({
  code,
  testCases,
}: {
  code: string
  testCases: TestCase[]
}): Promise<ExecutionResult[]> {
  const submissions = testCases.map((tc) => ({
    code,
    stdin: tc.input,
    timeLimit: 2,
    memoryLimit: 128,
  }))

  const res = await fetch(`${EXECUTOR_URL}/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissions }),
  })

  if (!res.ok) throw new Error("Batch execution failed")
  const data = await res.json()
  return data.results as ExecutionResult[]
}

export function judgeResults(
  results: ExecutionResult[],
  testCases: TestCase[]
): JudgedResult[] {
  return results.map((result, i) => ({
    testCase: i + 1,
    passed:
      result.status === "OK" &&
      result.stdout.trim() === testCases[i]!.expected.trim(),
    status: result.status,
    execTime: result.execTime,
    yourOutput: result.stdout.trim(),
    expected: testCases[i]!.expected.trim(),
  }))
}