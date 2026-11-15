# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: open the **Security** tab of this
repository and choose **Report a vulnerability**. Include the affected file or
feature, the steps to reproduce, and the impact you expect.

You should get a first reply within 7 days. Fixes land on `main`; there are no
separately maintained release branches.

## Scope

This repository is a starter template. Reports are in scope when the template
itself ships an insecure default, for example a secret exposed to the client
bundle, a missing auth check in `convex/` or `src/app/api/`, or an unsafe
dependency pin.

Problems in an app you built from the template are yours to fix, but a report
is still welcome when the root cause is in the template.

For hardening guidance when you build on the template, see
[`docs/SECURITY.md`](docs/SECURITY.md) and
[`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md).
