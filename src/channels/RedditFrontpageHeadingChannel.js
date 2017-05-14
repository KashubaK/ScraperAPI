// This is a channel.

function RedditFrontpageHeadingsChannel() {
    this.name = "Reddit Frontpage Headings"; // Must be unique.
    this.description = "Pull each heading from the Reddit Frontpage.";
    this.identifier = "reddit_frontpage_headings"; // Must be unique.

    this.url = "https://www.reddit.com/";

    this.instructions = [
      {
        "intent": "read_text",
        "target": "p.title"
      }
    ];
}