/* Pure command engine for the site terminal: no React, no Next, no DOM, no side effects. */

export type LineTone = "command" | "default" | "muted" | "accent" | "danger";

export type TerminalLine = {
  text: string;
  /** Right-aligned second column, used by the `ls` and `help` tables. */
  hint?: string;
  tone?: LineTone;
};

export type CommandResult = {
  lines: TerminalLine[];
  navigate?: string;
  clear?: boolean;
  theme?: "light" | "dark" | "toggle";
  exit?: boolean;
  /** Bring the collapsed blog terminal back into the sidebar. */
  expandSidebar?: boolean;
};

export type BlogContext = {
  posts: { slug: string; tags: string[] }[];
  tags: readonly string[];
};

/* Remembers whether the blog sidebar is folded away; read on the server so the page renders in that state. */
export const SIDEBAR_COOKIE = "lug-terminal-sidebar";

/* What the engine knows about the page it was typed on. */
export type CommandContext = {
  blog?: BlogContext | null;
  sidebarCollapsed?: boolean;
};

type Destination = {
  key: string;
  path: string;
  blurb: string;
  /** Everything a person might type to get here. `key` is added automatically. */
  aliases: string[];
};

export const DESTINATIONS: Destination[] = [
  {
    key: "sign-up",
    path: "/registration",
    blurb: "Join LUG@UoA",
    aliases: [
      "signup",
      "sign_up",
      "register",
      "registration",
      "join",
      "membership",
    ],
  },
  {
    key: "about-us",
    path: "/about",
    blurb: "What we do",
    aliases: ["about", "aboutus", "about_us", "info", "who"],
  },
  {
    key: "blog",
    path: "/blog",
    blurb: "Posts and updates",
    aliases: ["lug-blog", "lug_blog", "lugblog", "posts", "news", "writing"],
  },
  {
    key: "home",
    path: "/",
    blurb: "Back to the hero",
    aliases: ["~", "/", "index", "root", "start"],
  },
];

type CommandSpec = {
  name: string;
  /** Argument sketch shown in `help`, e.g. "<page>". */
  args?: string;
  blurb: string;
  aliases: string[];
};

const COMMANDS: CommandSpec[] = [
  { name: "help", blurb: "Show this list", aliases: ["?", "man", "commands"] },
  { name: "ls", blurb: "List the pages you can visit", aliases: ["dir", "ll"] },
  {
    name: "cd",
    args: "<page>",
    blurb: "Go to a page",
    aliases: ["open", "goto", "go", "run"],
  },
  { name: "clear", blurb: "Wipe the screen", aliases: ["cls"] },
  {
    name: "theme",
    args: "[dark|light]",
    blurb: "Switch the colour theme",
    aliases: [],
  },
  { name: "whoami", blurb: "Who's asking?", aliases: [] },
  { name: "exit", blurb: "Close the terminal", aliases: ["quit", "q"] },
];

/* Only offered on the blog, where there are posts and tags to act on. */
const BLOG_COMMANDS: CommandSpec[] = [
  { name: "posts", blurb: "Count the posts", aliases: [] },
  { name: "tags", blurb: "List the post tags", aliases: [] },
  {
    name: "tag",
    args: "<name>",
    blurb: "Filter posts by tag",
    aliases: ["filter"],
  },
  { name: "cat", args: "<post>", blurb: "Read a post", aliases: ["read"] },
  {
    name: "dock",
    blurb: "Dock the terminal to the sidebar",
    aliases: ["sidebar", "extend"],
  },
];

const NAV_VERBS = new Set(["cd", "open", "goto", "go", "run"]);
const POST_VERBS = new Set(["cat", "read"]);
const TAG_VERBS = new Set(["tag", "filter"]);

const normalise = (value: string) => value.trim().toLowerCase();

/** Strips the `./` that the on-screen rows use, so `./sign-up` and `sign-up` agree. */
const bare = (value: string) => normalise(value).replace(/^\.\//, "");

function findDestination(token: string): Destination | undefined {
  const needle = bare(token);
  if (!needle) return undefined;

  return DESTINATIONS.find(
    (dest) => dest.key === needle || dest.aliases.includes(needle),
  );
}

function findCommand(
  token: string,
  ctx: CommandContext = {},
): CommandSpec | undefined {
  const needle = normalise(token);
  const specs = ctx.blog ? [...COMMANDS, ...BLOG_COMMANDS] : COMMANDS;

  return specs.find(
    (cmd) => cmd.name === needle || cmd.aliases.includes(needle),
  );
}

/* Accepts `slug`, `./slug`, `blog/slug` and `slug.md`. */
const postSlug = (value: string) =>
  bare(value)
    .replace(/^(?:~\/)?blog\//, "")
    .replace(/\.md$/, "");

function findPost(token: string, blog: BlogContext) {
  const slug = postSlug(token);
  return blog.posts.find((post) => post.slug === slug);
}

/* ---------------------------------------------------------------- matching */

/* Levenshtein, two-row: catches swapped/mistyped letters that subsequence matching misses. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
    }

    previous = current;
  }

  return previous[b.length];
}

const MAX_TYPOS = 2;

/* One scorer drives both the suggestion list and "did you mean". */
export function scoreMatch(candidate: string, query: string): number {
  const c = normalise(candidate);
  const q = normalise(query);

  if (!q) return 1;
  if (!c) return -1;
  if (c === q) return 100;
  if (c.startsWith(q)) return 80 - (c.length - q.length) * 0.4;

  const index = c.indexOf(q);
  if (index > -1) return 58 - index;

  // Subsequence: "sgnup" still finds "sign-up", penalised by how spread out it is.
  let cursor = 0;
  let gaps = 0;
  let subsequence = true;
  for (const char of q) {
    const found = c.indexOf(char, cursor);
    if (found === -1) {
      subsequence = false;
      break;
    }
    gaps += found - cursor;
    cursor = found + 1;
  }

  if (subsequence) return 34 - gaps * 0.5;

  // Last resort: a couple of typos, but never enough to rewrite a short word.
  const distance = editDistance(c, q);
  if (distance > MAX_TYPOS || distance >= c.length) return -1;

  return 30 - distance * 5;
}

export type Suggestion = {
  /** Text inserted into the prompt. A trailing space means "needs an argument". */
  value: string;
  label: string;
  hint: string;
  group: "page" | "command";
  /** Extra words this entry matches on, never displayed. */
  keywords: string[];
};

const pageSuggestion = (dest: Destination): Suggestion => ({
  value: `cd ${dest.key}`,
  label: `cd ${dest.key}`,
  hint: dest.blurb,
  group: "page",
  keywords: [dest.key, `./${dest.key}`, ...dest.aliases, dest.path],
});

const commandSuggestion = (cmd: CommandSpec): Suggestion => ({
  value: cmd.args ? `${cmd.name} ` : cmd.name,
  label: cmd.args ? `${cmd.name} ${cmd.args}` : cmd.name,
  hint: cmd.blurb,
  group: "command",
  keywords: [cmd.name, ...cmd.aliases],
});

const ALL_SUGGESTIONS: Suggestion[] = [
  ...DESTINATIONS.filter((dest) => dest.key !== "home").map(pageSuggestion),
  ...COMMANDS.map(commandSuggestion),
  pageSuggestion(DESTINATIONS[DESTINATIONS.length - 1]),
];

const MAX_SUGGESTIONS = 6;

function rankArguments(
  head: string,
  arg: string,
  values: readonly string[],
  hint: string,
): Suggestion[] {
  return values
    .map((value) => ({ value, score: scoreMatch(value, arg) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((entry) => ({
      value: `${head} ${entry.value}`,
      label: `${head} ${entry.value}`,
      hint,
      group: "command",
      keywords: [],
    }));
}

export function getSuggestions(
  input: string,
  ctx: CommandContext = {},
): Suggestion[] {
  const query = input.trimStart();
  const pool = ctx.blog
    ? [...ALL_SUGGESTIONS, ...BLOG_COMMANDS.map(commandSuggestion)]
    : ALL_SUGGESTIONS;

  if (!query.trim()) return pool.slice(0, MAX_SUGGESTIONS);

  const [head, ...rest] = query.split(/\s+/);
  const verb = normalise(head);

  if (rest.length > 0 && ctx.blog && POST_VERBS.has(verb)) {
    const slugs = ctx.blog.posts.map((post) => post.slug);
    return rankArguments(head, rest.join(" "), slugs, "Read this post");
  }

  if (rest.length > 0 && ctx.blog && TAG_VERBS.has(verb)) {
    const tags = ["all", ...ctx.blog.tags];
    return rankArguments(head, rest.join(" "), tags, "Filter posts");
  }

  // Once a nav verb is typed, only pages can follow - suggest those directly.
  if (rest.length > 0 && NAV_VERBS.has(normalise(head))) {
    const arg = rest.join(" ");

    return DESTINATIONS.map((dest) => ({
      dest,
      score: Math.max(
        scoreMatch(dest.key, arg),
        ...dest.aliases.map((alias) => scoreMatch(alias, arg) - 1),
      ),
    }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((entry) => ({
        ...pageSuggestion(entry.dest),
        value: `${head} ${entry.dest.key}`,
        label: `${head} ${entry.dest.key}`,
      }));
  }

  return pool
    .map((suggestion) => ({
      suggestion,
      score: Math.max(
        scoreMatch(suggestion.value, query),
        // Aliases are a weaker signal than the canonical text they resolve to.
        ...suggestion.keywords.map((word) => scoreMatch(word, query) - 1),
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((entry) => entry.suggestion);
}

export function didYouMean(input: string): string | undefined {
  const best = getSuggestions(input)[0];
  if (!best) return undefined;

  const candidate = best.value.trim();
  return scoreMatch(candidate, input.trim()) >= 20 ? candidate : undefined;
}

/* --------------------------------------------------------------- responses */

const goTo = (dest: Destination): CommandResult => ({
  navigate: dest.path,
  lines: [
    {
      text: `opening ${dest.path}`,
      hint: dest.blurb,
      tone: "accent",
    },
  ],
});

function unknown(token: string, input: string): CommandResult {
  const guess = didYouMean(input);

  return {
    lines: [
      { text: `command not found: ${token}`, tone: "danger" },
      {
        text: guess
          ? `did you mean \`${guess}\`?`
          : "type `help` to see what works",
        tone: "muted",
      },
    ],
  };
}

const specLine = (cmd: CommandSpec): TerminalLine => ({
  text: cmd.args ? `  ${cmd.name} ${cmd.args}` : `  ${cmd.name}`,
  hint: cmd.blurb,
});

const helpLines = (ctx: CommandContext): TerminalLine[] => [
  { text: "COMMANDS", tone: "accent" },
  ...COMMANDS.map(specLine),
  ...(ctx.blog
    ? [
        { text: "BLOG", tone: "accent" as const },
        ...BLOG_COMMANDS.map(specLine),
        {
          text: "j/k to scroll, g/G for top and bottom",
          tone: "muted" as const,
        },
      ]
    : []),
  {
    text: "Page names also work on their own. Try `sign-up`.",
    tone: "muted",
  },
];

const listLines = (): TerminalLine[] => [
  { text: "PAGES", tone: "accent" },
  ...DESTINATIONS.filter((dest) => dest.key !== "home").map((dest) => ({
    text: `  ./${dest.key}`,
    hint: dest.blurb,
  })),
];

const countPosts = (count: number) =>
  `${count} ${count === 1 ? "post" : "posts"}`;

function filterByTag(arg: string, blog: BlogContext): CommandResult {
  const tag = normalise(arg).replace(/^#/, "");

  if (!tag) {
    return {
      lines: [{ text: "tag: expected a tag name", tone: "danger" }],
    };
  }

  if (tag === "all") {
    return {
      navigate: "/blog",
      lines: [
        {
          text: `showing all ${countPosts(blog.posts.length)}`,
          tone: "accent",
        },
      ],
    };
  }

  if (!blog.tags.includes(tag)) {
    return {
      lines: [
        { text: `no such tag: ${tag}`, tone: "danger" },
        { text: `try: ${blog.tags.join(", ")}`, tone: "muted" },
      ],
    };
  }

  const count = blog.posts.filter((post) => post.tags.includes(tag)).length;
  return {
    navigate: `/blog?tag=${tag}`,
    lines: [{ text: `#${tag}: ${countPosts(count)}`, tone: "accent" }],
  };
}

function openPost(arg: string, blog: BlogContext): CommandResult {
  if (!arg) {
    return { lines: [{ text: "cat: expected a post", tone: "danger" }] };
  }

  const post = findPost(arg, blog);
  if (!post) {
    return {
      lines: [
        { text: `no such file: ${postSlug(arg)}.md`, tone: "danger" },
        { text: "run `ls ./posts` to see the posts", tone: "muted" },
      ],
    };
  }

  return {
    navigate: `/blog/${post.slug}`,
    lines: [{ text: `opening ${post.slug}.md`, tone: "accent" }],
  };
}

function blogOnly(name: string): CommandResult {
  return {
    lines: [
      { text: `${name}: only available on the blog`, tone: "danger" },
      { text: "run `cd blog` first", tone: "muted" },
    ],
  };
}

export function resolveCommand(
  input: string,
  ctx: CommandContext = {},
): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const [head, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ");
  const command = findCommand(head, ctx);
  const blog = ctx.blog;

  // `open <post>` reads a post on the blog; anything else falls through to `cd`.
  if (blog && normalise(head) === "open" && arg && findPost(arg, blog)) {
    return openPost(arg, blog);
  }

  if (command?.name === "cd") {
    // `cd` with no argument, or `cd ..`, behaves like a shell: go home.
    if (!arg || arg === ".." || arg === "~") {
      return goTo(DESTINATIONS.find((dest) => dest.key === "home")!);
    }

    const dest = findDestination(arg);
    if (dest) return goTo(dest);

    const guess = didYouMean(arg);
    return {
      lines: [
        { text: `cd: no such page: ${arg}`, tone: "danger" },
        {
          text: guess
            ? `did you mean \`cd ${guess.replace(/^cd\s+/, "")}\`?`
            : "run `ls` to see the pages",
          tone: "muted",
        },
      ],
    };
  }

  switch (command?.name) {
    case "help":
      return { lines: helpLines(ctx) };

    case "ls": {
      const flag = normalise(arg);
      const tagFlag = flag.match(/^--tag=?\s*(.*)$/);
      if (tagFlag) return blog ? filterByTag(tagFlag[1], blog) : blogOnly("ls");

      if (blog && postSlug(flag) === "posts") {
        return {
          lines: [
            {
              text: `${countPosts(blog.posts.length)} in ~/blog`,
              tone: "accent",
            },
            ...blog.posts.map((post) => ({ text: `  ${post.slug}.md` })),
          ],
        };
      }

      return { lines: listLines() };
    }

    case "posts":
      return {
        lines: [
          {
            text: `${countPosts(blog!.posts.length)} in ~/blog`,
            tone: "accent",
          },
        ],
      };

    case "tags":
      return {
        lines: [
          {
            text: blog!.tags.map((tag) => `#${tag}`).join("  "),
            tone: "accent",
          },
        ],
      };

    case "tag":
      return filterByTag(arg, blog!);

    case "cat":
      return openPost(arg, blog!);

    case "dock":
      return ctx.sidebarCollapsed
        ? {
            expandSidebar: true,
            lines: [
              { text: "docking the terminal to the sidebar", tone: "accent" },
            ],
          }
        : {
            lines: [{ text: "already docked to the sidebar", tone: "muted" }],
          };

    case "clear":
      return { clear: true, lines: [] };

    case "theme": {
      const wanted = normalise(arg);
      if (wanted && wanted !== "dark" && wanted !== "light") {
        return {
          lines: [{ text: `theme: expected dark or light`, tone: "danger" }],
        };
      }

      return {
        theme: wanted === "dark" || wanted === "light" ? wanted : "toggle",
        lines: [{ text: "theme switched", tone: "accent" }],
      };
    }

    case "whoami":
      return {
        lines: [
          { text: "lug@uoa", tone: "accent" },
          {
            text: "Not a member yet. Run `cd sign-up` to fix that.",
            tone: "muted",
          },
        ],
      };

    case "exit":
      return { exit: true, lines: [] };
  }

  // Bare page names: `sign-up`, `./about-us`, `lug-blog`.
  const dest = findDestination(trimmed);
  if (dest) return goTo(dest);

  if (!blog && BLOG_COMMANDS.some((cmd) => cmd.name === normalise(head))) {
    return blogOnly(normalise(head));
  }

  if (normalise(head) === "sudo") {
    return {
      lines: [
        { text: "guest is not in the sudoers file.", tone: "danger" },
        { text: "This incident will be reported. (it won't)", tone: "muted" },
      ],
    };
  }

  return unknown(head, trimmed);
}
