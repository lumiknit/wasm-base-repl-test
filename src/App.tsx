import { Component } from "solid-js";
import toast, { Toaster } from "solid-toast";
import wabt from "wabt";

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

  return (
    <>
      <Toaster />
      <main class="container">
        <h1> WASM Test </h1>
        <button class="btn" onClick={handleConvert}>
          {" "}
          Convert{" "}
        </button>
        <div class="grid">
          <div>
            <h2> .wat </h2>
            <textarea ref={watRef!} class="code" />
          </div>
          <div>
            <h2> .wasm </h2>
            <textarea ref={wasmRef!} class="code" />
          </div>
        </div>
        <div>
          <button onClick={handleExecute}> Execute </button>
          <pre ref={resultRef}></pre>
        </div>
      </main>
    </>
  );
};

export default App;
