import { Component } from "solid-js";

type Props = {
  onSubmit: (code: string) => void;
};

const CodeEditView: Component<Props> = (props) => {
  let taRef: HTMLTextAreaElement;

  const handleSubmit = () => {
    const code = taRef!.value;
    props.onSubmit(code);
    taRef!.value = "";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // If shift+enter or ctrl+enter is pressed
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
      e.preventDefault();
    }
  };

  return (
    <>
      <h2> Code Editor </h2>
      <textarea class="code" ref={taRef!} onKeyDown={handleKeyDown} />
      <button class="btn" onClick={handleSubmit}>
        Submit
      </button>
    </>
  );
};

export default CodeEditView;
