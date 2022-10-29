# Logseq WordPress Export

A plugin to export the current page and format it for easy publishing with WordPress, or any other blogging platform. It copies the content of your page, and transforms it to make it easier to publish.
The transformations include:
- Turning **first-order** blocks into paragraphs. Second and third order will continue to be bullet points.
- Removing the `[[` and `]]`
- If referenced `[[Page]]` will have a `url` page attribute, than the reference will be transformed into a url link, so: `[[Polish Art Tweetstorm]]` will become `https://twitter.com/made_in_cosmos/status/1405910936423178252`.
    - That way, you can keep your content linked via references inside your logseq database, but have the same content use URLs on your blog
    - This will also work for a reference in a link line this one: `[Click here]([[Blog Post -  Solarpunk Art Contest]])`

## Instructions
1. Click the [···] in the top-right corner to open the toolbar
2. Click the "Download Page for WordPress" button
3. Verify your content looks ok,
4. Click "Copy HTML to Clipboard"
5. Paste in WordPress editor. If you paste in the title field, title will also get populated.



## Credits
- This plugin is a forked version of [Logseq PDF Export](https://github.com/sawhney17/logseq-pdf-export) from sawhney17. Thank you!
