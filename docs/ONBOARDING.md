# Developer Onboarding

## Purpose
This document explains the minimum knowledge and expectations required before contributing to the project.

The goal is not for every developer to master the full stack before starting. Instead, developers should reach the minimum level needed to contribute to an area of the project, then continue learning while working on the project.

---

## Project philosophy
This project is built with a server-first mindset.

Critical functionality must work with browser JavaScript disabled. Client-side JavaScript should be treated as progressive enhancement, not the default.

In practice, this means:
- prefer server-rendered solutions first
- do not use **client components** unless they are genuinely necessary
- important forms and user flows must work without browser JavaScript

---

## Styling in this project
This project uses Tailwind CSS for styling.

If you already know CSS, Tailwind is best thought of as a different way of writing styles.  Instead of creating lots of custom CSS classes in separate files, you apply small pre-defined classes directly in the HTML/TSX markup.

You are still using the same core styling ideas as normal CSS, such as layout, spacing, sizing, typography, colors, and responsive design.

When styling in this project:
- use Tailwind utility classes for normal styling
- reuse existing layout and spacing patterns before inventing new ones
- only add custom CSS when Tailwind is not enough, or when a style would be awkward to repeat many times with utilities
- read long Tailwind class lists in smaller chunks, such as layout, spacing, text, and responsive classes, rather than trying to understand the whole line at once

Contributors are not expected to be familiar with Tailwind before starting, but frontend contributors should be willing to learn the basics while working in the codebase.

---

## Universal baseline for all contributors
Before taking on project work, all contributors should be able to:
- clone the repository
- install dependencies
- run the project locally
- create a branch
- commit and push changes
- open a pull request
- follow project docs and conventions

All contributors should also understand:
- the project’s server-first / no-JS philosophy
- that server components are the default
- that client components are the exception

---

## Contribution tracks

### App / frontend track
For contributors working on pages, components, forms, and general app logic.

Expected knowledge:
- JavaScript fundamentals
- React fundamentals
- basic Next.js App Router understanding


### Database track
For contributors working on schema design, migrations, and query logic.

Expected knowledge:
- SQL fundamentals
- data modelling basics
- feature/data requirement understanding
- willingness to coordinate with app contributors

### Full-stack track
For contributors working across both the app and the database.

Expected knowledge:
- JavaScript fundamentals
- React fundamentals
- basic Next.js App Router understanding
- SQL basics

---

## App / frontend track prerequisites

### JavaScript
Contributors should be comfortable with:
- variables and types
- functions
- arrays and objects
- loops and conditionals
- `map`, `filter`, and `find`
- imports/exports
- async/await
- JSON

### React
Contributors should be comfortable with:
- components
- JSX
- props
- conditional rendering
- rendering lists
- basic state
- event handlers

### Next.js
Contributors should understand:
- what App Router is
- pages and layouts at a high level
- server vs client components
- why this project defaults to server components

---

## Database track prerequisites
Contributors should be familiar with:
- tables, rows, and columns
- primary keys
- foreign keys
- basic relationships
- `SELECT`, `INSERT`, `UPDATE`, and `DELETE`
- basic filtering with `WHERE`

Database contributors should also understand that schema design must support real application requirements and should not be done in isolation.

---
## How to learn in each track

### General advice
Do not try to learn everything before contributing. The goal is to learn enough to begin small, appropriate tasks, then continue learning while working on the project.

When learning a topic:
- use short resources first, such as beginner videos, short articles, official docs, or AI explanations
- do small exercises or examples so you actively use the concept
- focus on understanding the core idea rather than trying to memorise everything
- ask questions early if you are confused

### App / frontend track
For JavaScript and React, focus on learning the fundamentals needed to read and modify simple code confidently.

A good approach is:
1. learn a topic from a short resource
2. do a few small exercises or examples
3. make sure you can explain the idea in your own words
4. move on once you are comfortable enough to recognise and use it

For Next.js, focus only on the basics needed for this project at first, especially how App Router works, pages, layouts, and server vs client components.

### Database track
For SQL and data modelling, focus on understanding how data is stored, related, and queried.

A good approach is:
1. learn basic SQL syntax and concepts
2. practise simple queries on example tables
3. understand how primary keys and foreign keys connect tables
4. relate schema decisions back to actual app requirements

Database contributors should avoid designing schemas in isolation and should discuss data requirements with app contributors when needed.

### Using AI while learning
You are encouraged to use AI tools to help explain concepts, summarise documentation, or generate small examples.

However, AI should support your understanding rather than replace it. You should still be able to explain the code or concept in your own words.

Do not rely on AI to blindly generate large parts of implementation without understanding how they work.

---

## Ready to contribute checklist

#### Everyone
- [ ] I can run the project locally
- [ ] I understand the PR workflow
- [ ] I have read and understood the project philosophy and conventions

#### App / frontend contributors
- [ ] I understand basic JavaScript syntax and logic
- [ ] I can read a simple React component
- [ ] I understand props, lists, and conditional rendering
- [ ] I understand server vs client components at a basic level

#### Database contributors
- [ ] I understand basic SQL operations
- [ ] I understand primary keys and foreign keys
- [ ] I understand that schema design must support real app requirements

### How to use this checklist
This checklist is intended to help contributors judge whether they are ready to begin work in a particular track.

Completing the checklist does not mean you need to be an expert. It means you should be ready to start with small, guided tasks and continue learning while contributing.

Once you believe you have completed the relevant checklist for your track, let the tech lead know. Your readiness will then be checked informally, and an appropriate first task will be assigned.

If you are not yet ready for normal implementation tasks, you may still be able to contribute through setup, documentation, testing, or other beginner-friendly work.

---

## Task allocation
Issues will be assigned based on contributor readiness, interest and availability.

Not every contributor needs the same technical knowledge before starting, but all contributors must meet the universal baseline.

Some contributors may begin with frontend tasks, some with database tasks, and some may need more preparation before taking on implementation work.

Beginner contributors will usually start with smaller, lower-risk tasks before moving to larger features.