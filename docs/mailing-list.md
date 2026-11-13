# Mailing list

Admins send emails to members from `/admin/emails`. Members can opt out from a link in every email.

## Local setup

Emails are sent over SMTP (the standard protocol for handing an email to a mail server). Locally they go to **Mailpit**, a fake inbox that catches everything and delivers nothing for real.

1. Make sure your `.env` has the `SMTP_*` and `EMAIL_FROM` lines from `.env.example`.
2. Start Mailpit (`pnpm db:up` only starts the database):

```bash
docker compose up -d mailpit
```

3. Run `pnpm dev`, send an email from `/admin/emails`, then open the inbox at http://localhost:8025.

Mailpit keeps messages in memory, so restarting it empties the inbox.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | Mail server. `localhost` for Mailpit (`mailpit` inside Docker Compose). |
| `SMTP_PORT` | `1025` for Mailpit. Defaults to `587` if unset. Port `465` uses TLS from the start. |
| `SMTP_USER`, `SMTP_PASS` | Login for the mail server. Leave empty for Mailpit. |
| `EMAIL_FROM` | Sender shown to members, e.g. `LUG@UoA <no-reply@example.com>`. |
| `NEXT_PUBLIC_SITE_URL` | Used to build the absolute unsubscribe links and logo URL inside emails. |
| `AUTH_SECRET` | Also signs the unsubscribe tokens. |

## Audiences

Recipients are this year's members, de-duplicated by lowercased email, minus anyone who opted out.

- **All members**: everyone.
- **New members**: not returning.
- **Returning members**: has a row from an earlier registration year with the same email, or the same UPI + student ID.
- **UoA students only**: `isCurrentUoaStudent` is true.

The rules live in `src/domain/email/audience.ts`. The recipient count badge on the compose page uses the same rules.

## Sending

`src/features/mailing-list/deliverEmail.ts` sends **one message per recipient** (members never see each other's addresses), each with its own unsubscribe link.

Email statuses (`Email.status`):

- `DRAFT`: saved, not sent. Also what an email reverts to if nothing could be delivered (e.g. mail server unreachable), so it can be retried.
- `SENDING`: claimed for sending. The claim is atomic, so a double-click or resubmitted form can't send twice.
- `SENT`: every recipient was delivered to.
- `FAILED`: some recipients got it, but not all. It isn't retried automatically, because sending again would double-deliver to the ones that succeeded.

## Opting out

Each email has two ways to unsubscribe, both using a signed token that identifies the member's email (no expiry, so old emails keep working):

- **Footer link** → `/unsubscribe?token=…` shows a confirm page with a button. Opening the page changes nothing, because mail scanners (e.g. Outlook Safe Links) open every link automatically. The button unsubscribes, and the member can resubscribe from the same page.
- **Inbox "Unsubscribe" button** (Gmail, Outlook, etc.) uses the `List-Unsubscribe` headers and POSTs to `/unsubscribe/api?token=…`, which unsubscribes straight away.

Opt-outs are stored in `EmailAddressOptOut` by lowercased email address, so they still apply after a member re-registers in a later year.

## Data model

- `Email`: subject, Markdown body, audience, status, `sentAt`, `recipientCount`, author name.
- `EmailAddressOptOut`: one row per opted-out email address.

Migration: `prisma/migrations/20261025070428_add_mailing_list`.

## Handover checklist

- [ ] Set up a real sending account and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM` in production. Free options include a club Gmail account with an app password, or a free tier of a transactional email service. Check its daily sending limit.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real site address, or unsubscribe links and the logo will point at localhost.
- [ ] Don't change `AUTH_SECRET` casually: that breaks every unsubscribe link in emails already sent (and logs out admins).
- [ ] Send a test email to yourself and check it lands in the inbox, not spam.

## Not done yet

- **Draft listing.** Saved drafts persist in the database but there is no page to list or reopen them. If you navigate away from the composer you lose the draft URL.
- **Scheduled sending.** Once the site runs on the Pi, a cron job (a task the server runs on a timer) can send scheduled emails.
- Personalisation (e.g. first names), attachments, open/click tracking, bounce handling.