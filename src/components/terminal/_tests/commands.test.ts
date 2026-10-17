import { describe, expect, it } from "vitest";

import { didYouMean, getSuggestions, resolveCommand } from "../commands";

describe("resolveCommand navigation", () => {
  it.each([
    ["cd sign-up", "/registration"],
    ["cd registration", "/registration"],
    ["open join", "/registration"],
    ["goto about", "/about"],
    ["cd blog", "/blog"],
    ["./sign-up", "/registration"],
    ["./about-us", "/about"],
    ["blog", "/blog"],
    ["lug-blog", "/blog"],
    ["CD Sign-Up", "/registration"],
    ["  cd    blog  ", "/blog"],
  ])("%s navigates to %s", (input, path) => {
    expect(resolveCommand(input).navigate).toBe(path);
  });

  it.each(["cd", "cd ..", "cd ~", "home"])("%s goes home", (input) => {
    expect(resolveCommand(input).navigate).toBe("/");
  });
});

describe("resolveCommand effects", () => {
  it("clears the screen", () => {
    expect(resolveCommand("clear").clear).toBe(true);
    expect(resolveCommand("cls").clear).toBe(true);
  });

  it("exits", () => {
    expect(resolveCommand("exit").exit).toBe(true);
    expect(resolveCommand("q").exit).toBe(true);
  });

  it("toggles the theme by default and honours an explicit one", () => {
    expect(resolveCommand("theme").theme).toBe("toggle");
    expect(resolveCommand("theme light").theme).toBe("light");
    expect(resolveCommand("theme dark").theme).toBe("dark");
  });

  it("rejects an unknown theme without switching", () => {
    const result = resolveCommand("theme neon");
    expect(result.theme).toBeUndefined();
    expect(result.lines[0].tone).toBe("danger");
  });

  it("lists pages and commands without navigating", () => {
    for (const input of ["help", "ls"]) {
      const result = resolveCommand(input);
      expect(result.navigate).toBeUndefined();
      expect(result.lines.length).toBeGreaterThan(1);
    }
  });

  it("does nothing for blank input", () => {
    expect(resolveCommand("   ")).toEqual({ lines: [] });
  });
});

describe("resolveCommand errors", () => {
  it("reports an unknown command and suggests the closest match", () => {
    const result = resolveCommand("halp");
    expect(result.navigate).toBeUndefined();
    expect(result.lines[0].text).toContain("command not found");
    expect(result.lines[1].text).toContain("help");
  });

  it("reports an unknown page for a nav verb", () => {
    const result = resolveCommand("cd nowhere");
    expect(result.navigate).toBeUndefined();
    expect(result.lines[0].text).toContain("no such page");
  });

  it("keeps sudo as a joke, not a navigation", () => {
    const result = resolveCommand("sudo rm -rf /");
    expect(result.navigate).toBeUndefined();
    expect(result.lines[0].text).toContain("sudoers");
  });
});

describe("getSuggestions", () => {
  it("offers a starting set for an empty prompt", () => {
    const suggestions = getSuggestions("");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.map((s) => s.value)).toContain("cd sign-up");
  });

  it("ranks the exact command first", () => {
    expect(getSuggestions("help")[0].value).toBe("help");
  });

  it("matches aliases that are not shown in the label", () => {
    expect(getSuggestions("join")[0].value).toBe("cd sign-up");
    expect(getSuggestions("register")[0].value).toBe("cd sign-up");
  });

  it("survives typos via subsequence matching", () => {
    expect(getSuggestions("sgnup")[0].value).toBe("cd sign-up");
  });

  it("only offers pages once a nav verb is typed", () => {
    const suggestions = getSuggestions("cd ab");
    expect(suggestions[0].value).toBe("cd about-us");
    expect(suggestions.every((s) => s.group === "page")).toBe(true);
  });

  it("keeps the typed nav verb when completing a page", () => {
    expect(getSuggestions("open bl")[0].value).toBe("open blog");
  });

  it("marks argument-taking commands with a trailing space", () => {
    const cd = getSuggestions("cd").find((s) => s.value === "cd ");
    expect(cd).toBeDefined();
  });

  it("returns nothing for gibberish", () => {
    expect(getSuggestions("zzqqxx")).toEqual([]);
  });
});

describe("didYouMean", () => {
  it("corrects near misses", () => {
    expect(didYouMean("helo")).toBe("help");
    expect(didYouMean("clera")).toBe("clear");
  });

  it("gives up on nonsense", () => {
    expect(didYouMean("zzqqxx")).toBeUndefined();
  });
});

describe("blog commands", () => {
  const blog = {
    posts: [
      { slug: "wdcc-background", tags: ["events"] },
      { slug: "photobooth-glitch", tags: ["events"] },
      { slug: "meeting-snacks", tags: ["announcements"] },
    ],
    tags: ["announcements", "events", "tutorials"],
  };
  const ctx = { blog };

  it.each([
    "cat wdcc-background",
    "read ./wdcc-background.md",
    "cat blog/wdcc-background",
    "open wdcc-background",
  ])("%s opens the post", (input) => {
    const result = resolveCommand(input, ctx);
    expect(result.navigate).toBe("/blog/wdcc-background");
    expect(result.lines[0].text).toBe("opening wdcc-background.md");
  });

  it("reports a missing post", () => {
    const result = resolveCommand("cat nope", ctx);
    expect(result.navigate).toBeUndefined();
    expect(result.lines[0].text).toBe("no such file: nope.md");
  });

  it("still treats `open <page>` as cd on the blog", () => {
    expect(resolveCommand("open about-us", ctx).navigate).toBe("/about");
  });

  it.each(["tag events", "filter #events", "ls --tag=events"])(
    "%s filters by tag",
    (input) => {
      const result = resolveCommand(input, ctx);
      expect(result.navigate).toBe("/blog?tag=events");
      expect(result.lines[0].text).toBe("#events: 2 posts");
    },
  );

  it("clears the filter with `tag all`", () => {
    const result = resolveCommand("tag all", ctx);
    expect(result.navigate).toBe("/blog");
    expect(result.lines[0].text).toBe("showing all 3 posts");
  });

  it("rejects an unknown tag with the known ones as a hint", () => {
    const result = resolveCommand("tag meetings", ctx);
    expect(result.navigate).toBeUndefined();
    expect(result.lines[1].text).toBe("try: announcements, events, tutorials");
  });

  it("counts posts and lists tags", () => {
    expect(resolveCommand("posts", ctx).lines[0].text).toBe(
      "3 posts in ~/blog",
    );
    expect(resolveCommand("ls ./posts", ctx).lines[0].text).toBe(
      "3 posts in ~/blog",
    );
    expect(resolveCommand("tags", ctx).lines[0].text).toBe(
      "#announcements  #events  #tutorials",
    );
  });

  it("docks the sidebar only when it is collapsed", () => {
    expect(
      resolveCommand("dock", { ...ctx, sidebarCollapsed: true }).expandSidebar,
    ).toBe(true);

    const docked = resolveCommand("sidebar", ctx);
    expect(docked.expandSidebar).toBeUndefined();
    expect(docked.lines[0].text).toBe("already docked to the sidebar");
  });

  it("keeps blog commands to the blog", () => {
    expect(resolveCommand("posts").navigate).toBe("/blog");
    expect(resolveCommand("cat wdcc-background").lines[0].text).toBe(
      "cat: only available on the blog",
    );
    expect(resolveCommand("dock").lines[0].text).toBe(
      "dock: only available on the blog",
    );
  });

  it("suggests post slugs and tags as arguments", () => {
    expect(getSuggestions("cat wd", ctx)[0].value).toBe("cat wdcc-background");
    expect(getSuggestions("tag ev", ctx)[0].value).toBe("tag events");
  });

  it("adds a blog section to help", () => {
    const text = resolveCommand("help", ctx).lines.map((line) => line.text);
    expect(text).toContain("BLOG");
    expect(resolveCommand("help").lines.map((line) => line.text)).not.toContain(
      "BLOG",
    );
  });
});
