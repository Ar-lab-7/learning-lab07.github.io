
# Adding Blogs to Learning Lab

## Method 1: Using the Blog Creator

1. Click the "Create Blog" button in the app
2. Fill in the blog details and content
3. Save the blog

## Method 2: Adding JSON Files Directly

1. Create a new JSON file in the `public/blogs` directory
2. Use the following structure:

```json
{
  "title": "Your Blog Title",
  "content": "Your blog content with markdown",
  "date": "Apr 11, 2025",
  "readTime": "5 mins read",
  "imageUrl": "https://example.com/image.jpg"
}
```

3. Restart the app to load the new blog

## Method 3: Importing Blogs

1. Go to Settings
2. Click "Import Blogs" 
3. Select a previously exported JSON file
