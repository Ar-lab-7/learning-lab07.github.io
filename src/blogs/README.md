
# Blog Files Directory

This directory contains JSON blog files for the Learning Lab application.

## Adding New Blogs

To add a new blog, create a JSON file in this directory with the following structure:

```json
{
  "title": "Your Blog Title",
  "content": "Your blog content with markdown formatting",
  "date": "Apr 11, 2025",
  "readTime": "5 mins read",
  "imageUrl": "https://example.com/your-image.jpg"
}
```

## Markdown Support

The content field supports markdown formatting including:
- Headings (# Heading)
- Bold (**bold text**)
- Italic (*italic text*)
- Lists (- Item)
- Code blocks (```js code```)
- Tables (|Header|Header| with |---|---| below)
- Images (![alt](url))
- Links ([text](url))

## Automatic Loading

The application will automatically load all blog files from this directory.
