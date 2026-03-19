import { Play, Zap } from "lucide-react";
import { memo, type ReactNode } from "react";

interface CodeLine {
  indent: number;
  content: ReactNode;
}

interface CodeEditorProps {
  codeLines: number;
  code: readonly CodeLine[];
}

function CodeEditorComponent({ codeLines, code }: CodeEditorProps) {
  return (
    <div className="col-span-6 flex flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/40 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-blue-400 font-semibold">Python 3</span>
        </div>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground font-medium">
            <Play className="h-2.5 w-2.5" />
            Run
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-semibold">
            <Zap className="h-2.5 w-2.5" />
            Submit
          </div>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 p-3 font-mono bg-background overflow-hidden">
        {code.slice(0, codeLines).map((line, i) => (
          <div key={i} className="flex leading-6">
            <span className="text-muted-foreground w-5 shrink-0 text-right mr-3 select-none">{i + 1}</span>
            <span style={{ paddingLeft: `${line.indent * 12}px` }} className="whitespace-pre">
              {line.content}
            </span>
          </div>
        ))}
        {/* blinking cursor */}
        <div className="flex leading-6">
          <span className="text-muted-foreground w-5 shrink-0 text-right mr-3 select-none">{codeLines + 1}</span>
          <span
            className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse mt-1 ml-0"
            style={{ paddingLeft: `${(code[Math.min(codeLines, code.length - 1)]?.indent ?? 0) * 12}px` }}
          />
        </div>
      </div>

      {/* Test results (collapsed teaser) */}
      <div className="border-t border-border bg-card/40 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Test Results</span>
          <span className="text-muted-foreground">2/2 passed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono font-bold">✓ Case 1</span>
          <span className="text-emerald-400 font-mono font-bold">✓ Case 2</span>
        </div>
      </div>
    </div>
  );
}

export const CodeEditor = memo(CodeEditorComponent);
