---
title: Nuxeo Agentic UI — the short version
parent: Product
order: 0
last_reviewed: 2026-10-07
repo_commit: 8be3182
audience: presales, customers, partners
---

# Nuxeo Agentic UI — the short version

For presales engineers, customers and partners. It takes about five minutes, describes what the
`main` branch does today (checked on 7 October 2026), and leaves the longer documents to the end.

## What it is

Nuxeo Agentic UI is a modern web interface for a Nuxeo content repository. It runs in the
browser, talks to your Nuxeo server, and is delivered as a Nuxeo Marketplace package. It is in
Beta, so things can still change.

You will also see it called **Nuxeo Satori**. That is the programme name, and it is the title the
Marketplace listing shows today; the package itself is `nuxeo-agentic-ui`. It is not called
"Agentic AI". "Agentic" describes how it is built and customised — by AI coding agents following
written rules — not the AI features inside it, which are optional.

## What it does

The everyday work of a Nuxeo user:

- browse folders, search (full text, filters, saved searches) and open a document to preview it;
- create, upload, edit, move, copy and delete documents, and restore them from the trash;
- versions, permissions, history, comments, tags, collections, favorites and publishing;
- see and act on your workflow tasks;
- manage users, groups and vocabularies;
- in seven languages: English, French, German, Japanese, Dutch, Thai and Simplified Chinese.

Some features need server components this package does not include. The AI features
(natural-language search, summaries, tag suggestions, chat) need a separate Nuxeo package,
Knowledge Discovery needs its own backend, and the annotation viewer needs ARender. Without them
those features do not work, and the rest of the application does.

## The four "layers", in plain words

The longer documents sort every change into four numbered layers:

| Layer | In plain words                                                                                                  | Code?                  | Rebuild?            |
| ----- | --------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------- |
| 0     | **Settings**: product name, colours, language, on-screen wording                                                | No                     | No                  |
| 1     | **Arrangement**: which menu entries, buttons, tabs and columns appear, in what order, under what name, for whom | No                     | No                  |
| 2     | **Your own code**: new screens, new actions, your own conditions                                                | Yes, written by you    | Yes, your own build |
| 3     | **Help for AI coding agents**: instructions, code generators and checks that make layer 2 quicker to write      | Ships with the package | —                   |

On this page, layers 0 and 1 are "configuration" and layers 2 and 3 are "code".

## Where configuration lives today

In two places, and both are a known problem:

1. **A settings file on the Nuxeo server**,
   `nxserver/nuxeo.war/agentic-ui-config/bootstrap.json`, created by someone with access to the
   server's files by copying the sample the package installs beside it, `bootstrap.example.json`,
   and editing the copy. It holds the name, colours and default language. The package never
   installs, replaces or deletes `bootstrap.json`, so an upgrade leaves it alone; that was
   rehearsed on a real server with `nuxeoctl` (NXSAT-317). Without the file the application uses
   its defaults. Users see a change the next time they open the application.
2. **The manifest**, which holds the wording and the whole arrangement. Since NXSAT-312 it is part
   of a configuration package installed on the server, like the settings, and is the same for
   every user; it is no longer a Nuxeo Note in the repository, and an old Note is not read.

Editing files on a server is not a deployment, and some regulated customers require configuration
to be kept apart from repository data. The plan is to let you ship your configuration in **your
own Marketplace package that depends on ours**. That is planned, not built.

## What you can change without code

| You want to…                                                                                                                   | Where                                          | Details                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Change the product name and the browser-tab title                                                                              | settings file, `branding`                      | [Runbook, beat 3](../../docs/beta-demo-runbook.md#beat-3--rebrand-no-rebuild-3-min)                             |
| Change the colours, or add your own colour theme and make it the default                                                       | settings file, `themes` and `defaultThemeId`   | [Runbook, beat 3](../../docs/beta-demo-runbook.md#beat-3--rebrand-no-rebuild-3-min)                             |
| Choose the default language                                                                                                    | settings file, `defaultLanguage`               | [Our default settings](../../nuxeo-agentic-core/src/main/resources/agentic-ui-config/bootstrap.defaults.json)   |
| Change on-screen wording — the same text in every language                                                                     | configuration document, `labels`               | [Runbook, beat 4](../../docs/beta-demo-runbook.md#beat-4--relabel-the-product-2-min)                            |
| Hide, reorder or rename a menu entry, toolbar button, tab, list column or bulk action                                          | configuration document, `extensions.overrides` | [Extension reference, overrides](../../docs/extension-reference.md#per-id-overrides)                            |
| Add a menu entry that opens an existing page                                                                                   | configuration document, `extensions.slots`     | [Runbook, beat 5](../../docs/beta-demo-runbook.md#beat-5--nav-hide-one-add-one-and-the-security-question-4-min) |
| Show an entry only when a condition holds: the user can edit the document, is an administrator, has several documents selected | configuration document, a `rule` on the entry  | [Extension reference, rules](../../docs/extension-reference.md#4-rules--the-registered-predicates)              |
| Choose which list columns are offered, and which start switched on                                                             | configuration document, `extensions.slots`     | [Runbook, beat 6](../../docs/beta-demo-runbook.md#beat-6--columns-3-min)                                        |

The conditions are a fixed list that ships with the product; adding your own is code. Every name
that configuration can address is listed in the
[extension reference](../../docs/extension-reference.md).

For example, this configuration document hides Trash, renames Collections to "Repository", and
shows Administration to administrators only:

```json
{
  "version": 1,
  "extensions": {
    "overrides": {
      "app.navbar.trash": { "visible": false },
      "app.navbar.collections": { "label": "Repository" },
      "app.navbar.administration": { "rule": "app.rules.isAdministrator" }
    }
  }
}
```

## Two things configuration deliberately does not do

- **Change what a shipped button does.** You can rename, move or hide a shipped button but not
  make it do something else, because otherwise a button reading "Add to favorites" could delete
  the document and Nuxeo would allow it, since the user really has that permission. Changing
  behaviour is code, where the change is reviewed and versioned.
- **Restrict what people can do.** Hiding a button changes what the screen offers, not what the
  server allows. Nuxeo checks permissions on every operation, so restrict access with Nuxeo
  permissions.

## What it does not do today

- **Change the logo.** Name and colours, yes; logo, no. A configurable logo is in review:
  [pull request #307](https://github.com/nuxeo/agentic-ui-poc/pull/307).
- **Vary the fields by document type.** The page shows and edits a fixed set of standard
  fields, so the fields of your own document types are not shown or editable. Conditions on a
  document's type exist (`app.rules.isType`), and a type can have its own View tab through the
  `documentView` slot, but the properties and edit form are the same for every type.
- **Deploy configuration from your own package.** Planned, not built; see above.
- **Install from a public registry.** The Marketplace package has only been published to Nuxeo's
  pre-production Marketplace. The developer package your own code builds against,
  `@nuxeo-satori/platform`, is not on any npm registry yet.
- **Run your own code inside the shipped application.** See the next section.
- **Edit every permission level.** The Permissions tab on the Browse page handles Nuxeo's Read,
  ReadWrite and Everything. On a folder that also carries any other permission it refuses to save
  rather than delete that entry; manage those in Nuxeo.

## What needs code

- a new screen or panel, or what a tab shows;
- a button or bulk action that does something new (configuration can place a button only for an
  action that code has registered);
- your own conditions, such as "the user is in the legal team";
- changing what a shipped button does;
- screens and fields specific to your document types.

Today a developer writes an Angular library against `@nuxeo-satori/platform`, starting from the
code generators that ship with it, and adds it to an application built from our template app,
`apps/nuxeo-satori-template`. That code does not plug into the shipped application, and because
the package is not published yet, you build it from this repository. Publishing it is planned.

## How to start

1. **Run it.** On your own machine, against Nuxeo in Docker: follow
   [Developer Getting Started](../30-engineering/01-getting-started.md). You need Docker,
   Node.js 20, and a GitHub token that can read Hyland's and Alfresco's GitHub Packages.
2. **Change something without code.** Copy the sample settings file to `bootstrap.json` and edit
   the copy ([beat 3](../../docs/beta-demo-runbook.md#beat-3--rebrand-no-rebuild-3-min) shows
   where), or create the configuration document
   and paste the example above. Create it as a plain-text Note (`note:mime_type` `text/plain`) as
   [Part 0.6 of the runbook](../../docs/beta-demo-runbook.md#06-create-the-manifest-document)
   does. In any other format Nuxeo escapes the quotes in the JSON, and the application then
   ignores the document and keeps its defaults, without an error. Beats 3 to 7 of the
   [demo runbook](../../docs/beta-demo-runbook.md#part-4--the-demo-script) give the exact JSON
   for each change and what you should see.
3. **Customise it with an AI coding agent.** Use the
   [Nuxeo Agentic UI prompt library](https://github.com/nuxeo-sandbox/nuxeo-agentic-ui-prompts),
   started by Nuxeo presales. Its rule is that the agent reads our source but never changes it,
   and writes everything into your own Marketplace package that depends on `nuxeo-agentic-ui`.
   Its branding prompt makes your package's installer overwrite our settings file; that prompt is
   marked "Not tested yet", and this product does not yet support or test that route. Prompts are
   collected there rather than in this repository.

## Read more

| If you want to…                                        | Read                                                                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| See every feature and its status                       | [Feature Catalog](02-feature-catalog.md)                                                                              |
| Know every name configuration can address              | [Extension reference](../../docs/extension-reference.md)                                                              |
| Walk through each no-code change, and what not to demo | [Beta demo runbook](../../docs/beta-demo-runbook.md), written for presenters                                          |
| Understand the product case and the layers in depth    | [Product Overview](01-product-overview.md)                                                                            |
| Install and troubleshoot the Marketplace package       | [Deployment & Troubleshooting](../30-engineering/13-deployment-and-troubleshooting.md)                                |
| Write your own code against the package                | [Platform package README](../../libs/platform/README.md) and [its guide for extenders](../../libs/platform/AGENTS.md) |
| Know where the programme stands                        | [Programme status](../../docs/adf-hx-beta-plan.md#programme-status) in the Beta plan                                  |
| Customise it with an AI coding agent                   | [Prompt library](https://github.com/nuxeo-sandbox/nuxeo-agentic-ui-prompts)                                           |
