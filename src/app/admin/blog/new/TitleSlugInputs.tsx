"use client";

import { useState } from "react";
import { slugify } from "@/domain/blog/slugify";

type Props = {
  inputClass: string;
  labelClass: string;
  initialTitle?: string;
  initialSlug?: string;
};

export function TitleSlugInputs({
  inputClass,
  labelClass,
  initialTitle = "",
  initialSlug = "",
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(initialSlug !== "");

  return (
    <>
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitle(nextTitle);
            if (!slugEdited) setSlug(slugify(nextTitle));
          }}
          maxLength={200}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(event.target.value !== "");
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Use lowercase letters, numbers and hyphens only"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-600">
          Generated from the title; you can change it.
        </p>
      </div>
    </>
  );
}
