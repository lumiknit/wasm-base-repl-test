import { Component } from "solid-js";
import toast, { Toaster } from "solid-toast";
import wabt from "wabt";

import "./lib/s-parser";
import InstructionView from "./Instruction";
import CodeEditView from "./CodeEditView";
import { parseSExpr } from "./lib/s-parser";

const u8toHex = (arr: Uint8Array) => {
  // Each line has 16 bytes
  let lines = [];
  for (let i = 0; i < arr.length; i += 16) {
    let line = arr.slice(i, i + 16);
    let hex = Array.from(line)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    lines.push(hex);
  }
  return lines.join("\n");
};

const convertWatToWasm = async (wat: string) => {
  let w = await wabt();
  let module = w.parseWat("test.wat", wat);
  let bin = module.toBinary({ log: true });
  return bin.buffer;
};

const App: Component = () => {
  let parseResultRef: HTMLPreElement;
  let watRef: HTMLTextAreaElement;
  let wasmRef: HTMLTextAreaElement;
  let resultRef: HTMLPreElement;

  const handleConvert = async () => {
    const bin = await convertWatToWasm(watRef!.value);
    wasmRef!.value = u8toHex(bin);
    toast.success("Convert button clicked!");
  };

  const handleExecute = async () => {
    const bin = await convertWatToWasm(watRef!.value);
    const mod = await WebAssembly.compile(bin);
    const instance = await WebAssembly.instantiate(mod);
    const entry = instance.exports._start as any;
    if (entry === undefined) {
      toast.error("No '_start' function found!");
      return;
    }
    // Invoke the function
    const result = entry();
    resultRef!.innerText = result.toString();
    console.log("Result:", result);
    toast.success("Execute button clicked!");
  };

  const handleSubmit = (code: string) => {
    // Set the code to the textarea
    let parsed;
    try {
      parsed = parseSExpr(code);
    } catch (e) {
      toast.error(String(e));
      parseResultRef!.innerText = String(e);
      return;
    }

    // Display the parsed result
    parseResultRef!.innerText = JSON.stringify(parsed, null, 2);
  };

  return (
    <>
      <Toaster />
      <main class="container">
        <h1> Simple Interpreter </h1>

        <InstructionView />

        <CodeEditView onSubmit={handleSubmit} />

        <h2> Parsed Result </h2>
        <pre ref={parseResultRef!} />

        <h2> Compiled .wat </h2>
        <pre ref={watRef!} class="code" />

        <h2> Compiled .wasm </h2>
        <pre ref={wasmRef!} class="code" />
      </main>
    </>
  );
};

export default App;
