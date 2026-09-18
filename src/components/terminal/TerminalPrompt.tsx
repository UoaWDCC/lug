"use client";

import { useId, useMemo, useRef, useState } from "react";

import { getSuggestions, type Suggestion } from "./commands";
import { useTerminal } from "./TerminalProvider";

type TerminalPromptProps = {
  /** Shown after `lugatuoa:~`, e.g. "/about". */
  cwd?: string;
  /** Escape with an empty prompt, e.g. to close the dock. */
  onEscape?: () => void;
  /** Root classes; the suggestion popup anchors to the nearest positioned ancestor. */
  className?: string;
};

export default function TerminalPrompt({
  cwd = "",
  onEscape,
  className = "relative",
}: TerminalPromptProps) {
  const { run, history } = useTerminal();

  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const suggestions = useMemo(() => getSuggestions(value), [value]);
  const visible = listOpen ? suggestions : [];

  const preview =
    activeIndex >= 0 ? visible[activeIndex] : (visible[0] ?? undefined);

  /* fish-style inline completion: only when the caret sits at the very end. */
  const ghost =
    preview && value.length > 0 && caret === value.length
      ? preview.value.toLowerCase().startsWith(value.toLowerCase())
        ? preview.value.slice(value.length)
        : ""
      : "";

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? 0);

  function write(next: string) {
    setValue(next);
    setCaret(next.length);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(next.length, next.length);
    });
  }

  function complete(suggestion: Suggestion) {
    write(suggestion.value);
    setActiveIndex(-1);
    setListOpen(true);
  }

  function submit(text: string) {
    run(text);
    setValue("");
    setCaret(0);
    setListOpen(false);
    setActiveIndex(-1);
    setHistoryCursor(null);
  }

  function recall(step: -1 | 1) {
    if (history.length === 0) return;

    const from = historyCursor ?? history.length;
    const next = from + step;

    if (next < 0) return;

    if (next >= history.length) {
      setHistoryCursor(null);
      write("");
      return;
    }

    setHistoryCursor(next);
    write(history[next]);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        if (listOpen) {
          setListOpen(false);
        } else if (value) {
          write("");
        } else if (onEscape) {
          onEscape();
        } else {
          inputRef.current?.blur();
        }
        return;

      case "ArrowDown":
        event.preventDefault();
        if (historyCursor !== null) {
          recall(1);
        } else if (!listOpen) {
          setListOpen(true);
          setActiveIndex(0);
        } else if (visible.length > 0) {
          setActiveIndex((index) => (index + 1) % visible.length);
        }
        return;

      case "ArrowUp":
        event.preventDefault();
        if (listOpen && activeIndex > 0) {
          setActiveIndex(activeIndex - 1);
        } else if (listOpen && activeIndex === 0) {
          setActiveIndex(-1);
        } else {
          recall(-1);
        }
        return;

      case "ArrowRight":
        if (ghost && caret === value.length) {
          event.preventDefault();
          write(value + ghost);
        }
        return;

      case "Tab": {
        // Shift+Tab still walks out of the terminal, so keyboard users aren't trapped.
        if (event.shiftKey) return;
        const target = visible[activeIndex >= 0 ? activeIndex : 0];
        if (!target) return;
        event.preventDefault();
        complete(target);
        return;
      }

      case "Enter": {
        event.preventDefault();
        const chosen = activeIndex >= 0 ? visible[activeIndex] : undefined;

        if (chosen) {
          // A trailing space means the entry still needs an argument.
          if (chosen.value.endsWith(" ")) complete(chosen);
          else submit(chosen.value);
          return;
        }

        submit(value);
        return;
      }
    }
  }

  /* The block caret sits on the first ghost character, not in front of it, to avoid a gap. */
  const before = value.slice(0, caret);
  const under = (ghost ? ghost[0] : value[caret]) ?? " ";
  const after = value.slice(caret + 1);
  const ghostTail = ghost.slice(1);

  return (
    <div className={className}>
      {visible.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Command suggestions"
          // Margin clears the prompt row's own top padding, keeping the popup aligned to the divider.
          className="absolute inset-x-0 bottom-full z-20 mb-6 max-h-[300px] overflow-y-auto rounded-lg border border-[var(--input-border)] bg-[var(--menu-bg)] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
        >
          {visible.map((suggestion, index) => (
            <li key={suggestion.value} role="presentation">
              <button
                type="button"
                role="option"
                id={`${listId}-${index}`}
                aria-selected={index === activeIndex}
                // Mouse down instead of click, so the input never loses focus.
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (suggestion.value.endsWith(" ")) complete(suggestion);
                  else submit(suggestion.value);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                style={{ animationDelay: `${index * 22}ms` }}
                className={`term-suggestion flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-md px-4 py-2 text-left font-mono text-[16px] transition-colors duration-150 ${
                  index === activeIndex
                    ? "bg-[var(--row-hover-bg)] text-[var(--fg)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <span className="truncate font-semibold text-[var(--row-cmd)]">
                  {suggestion.label}
                </span>
                <span className="shrink-0 text-[15px] text-[var(--muted)]">
                  {suggestion.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* A label, so clicking the `lugatuoa:~$` prefix focuses the input natively. */}
      <label className="flex cursor-text items-baseline gap-2.5 font-mono text-[17px]">
        <span className="shrink-0 font-semibold whitespace-nowrap text-[var(--accent-text)]">
          lugatuoa:~{cwd}$
        </span>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <input
            ref={inputRef}
            data-terminal-prompt
            type="text"
            value={value}
            role="combobox"
            aria-expanded={visible.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            aria-label="Terminal command"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(event) => {
              setValue(event.target.value);
              setCaret(
                event.target.selectionStart ?? event.target.value.length,
              );
              setActiveIndex(-1);
              setHistoryCursor(null);
              setListOpen(true);
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onClick={syncCaret}
            onFocus={() => {
              setFocused(true);
              setListOpen(true);
            }}
            onBlur={() => {
              setFocused(false);
              setListOpen(false);
            }}
            className="absolute inset-0 w-full bg-transparent font-mono text-[17px] text-transparent caret-transparent outline-none"
          />

          <div aria-hidden className="whitespace-pre text-[var(--fg)]">
            {before}
            <span
              className="term-caret"
              data-idle={!focused}
              data-ghost={ghost.length > 0}
            >
              {under}
            </span>
            {after}
            <span className="text-[var(--muted)] opacity-70">{ghostTail}</span>
          </div>
        </div>

        {/* Shares the prompt row rather than adding one, so the panel keeps its height. */}
        <span
          aria-hidden
          className={`hidden shrink-0 gap-3.5 text-[13px] text-[var(--muted)] transition-opacity duration-200 sm:flex ${
            focused ? "opacity-70" : "opacity-0"
          }`}
        >
          <span>↑↓ browse</span>
          <span>⇥ complete</span>
          <span>⏎ run</span>
        </span>
      </label>
    </div>
  );
}
