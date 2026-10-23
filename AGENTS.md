<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep management UI under the authenticated route layout and perform owner verification in every management server function; route gates do not protect RPC endpoints.
- Store invitation models, individual invitations, orders and customers separately; archive or deactivate invitations instead of deleting content, with public delivery implemented separately from owner-only queries.
