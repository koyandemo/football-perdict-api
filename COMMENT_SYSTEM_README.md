# Social Media Style Comment System

This document describes the complete comment system implementation for the football prediction application, featuring:

1. Main comments
2. Threaded/nested replies
3. Reactions (likes)

## Database Schema

The comment system consists of two main tables and several helper functions:

### 1. Comments Table (Enhanced)

The existing `comments` table has been enhanced with:

- `parent_comment_id`: References another comment for threaded replies
- Foreign key constraint for `user_id` to ensure data integrity

### 2. Comment Reactions Table

A new table to store user reactions (likes, etc.) to comments:

```sql
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  reaction_id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction_type)
);
```

### 3. Helper Functions

Three PostgreSQL functions have been created to simplify data retrieval:

1. `count_replies_for_comment(comment_id)`: Returns the number of replies to a comment
2. `count_replies_for_comments(comment_ids[])`: Returns reply counts for multiple comments
3. `count_reactions_for_comment(comment_id, reaction_type)`: Returns reaction counts for a comment

## Deployment Instructions

1. Run the `comment-system-deployment.sql` script in your Supabase SQL Editor
2. Restart your API server to ensure it recognizes the new schema
3. The client-side code should work immediately with the updated API

## API Endpoints

### Get Match Comments (with reply counts and like counts)
```
GET /matches/:id/comments?page=1&limit=10
```

Returns top-level comments with `reply_count` and `like_count` fields.

### Get Comment Replies (with like counts)
```
GET /matches/:id/comments/replies?page=1&limit=5
```

Returns replies to a specific comment with `like_count` field.

### Add/Remove Comment Reaction
```
POST /matches/:id/comments/reactions
```

Body:
```json
{
  "user_id": 123,
  "reaction_type": "like"
}
```

This endpoint toggles reactions - if the user has already liked the comment, it removes the like; otherwise, it adds a like.

## Client-Side Implementation

The client-side implementation includes:

1. **EnhancedCommentItem Component**: Handles display and interaction for both main comments and replies
2. **Threaded Display**: Replies are visually indented and nested under their parent comments
3. **Like Toggle**: Clicking the like button toggles the reaction and updates the UI immediately
4. **Pagination**: Both comments and replies support pagination with "Load More" functionality

## Troubleshooting

### If likes aren't updating:
1. Ensure the `comment_reactions` table exists
2. Check that the foreign key constraints are properly set up
3. Verify that the API functions are working correctly

### If replies aren't nesting properly:
1. Ensure the `parent_comment_id` column exists in the `comments` table
2. Check that the API is correctly filtering top-level comments
3. Verify that the client is properly transforming the API response

## Testing

To test the system:

1. Create a main comment
2. Reply to that comment
3. Like both the main comment and the reply
4. Verify that:
   - Replies appear nested under the main comment
   - Like counts update correctly
   - The like button changes color when clicked
   - Pagination works for both comments and replies

The system should now provide a full social media-style commenting experience.