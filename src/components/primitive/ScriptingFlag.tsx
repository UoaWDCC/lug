/* Absent when scripts are blocked, which is what the `nojs:` variant keys off. */

const script = `document.documentElement.dataset.js="";`;

export default function ScriptingFlag() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
