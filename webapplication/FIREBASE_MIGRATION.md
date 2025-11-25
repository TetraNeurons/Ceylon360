# Firebase Admin SDK Migration Guide

## What Changed?

We've migrated from using `firebase_config.json` to environment variables for Firebase Admin SDK credentials. This is more secure and follows best practices for production deployments.

## Benefits

- **Security**: Credentials are stored in `.env` (not committed to git)
- **Flexibility**: Easy to change credentials per environment (dev, staging, prod)
- **Deployment**: Works seamlessly with platforms like Vercel, Netlify, etc.
- **No file management**: No need to manage separate JSON files

## Migration Steps

### 1. Environment Variables Added

The following variables have been added to your `.env` file:

```env
FIREBASE_PROJECT_ID=tourguide-17ed2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tourguide-17ed2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_STORAGE_BUCKET=tourguide-17ed2.firebasestorage.app
```

### 2. Code Changes

- `lib/firebase-admin.ts` now reads from environment variables instead of `firebase_config.json`
- No changes needed in your application code - the API remains the same

### 3. Deployment

When deploying to production:

1. **Vercel/Netlify**: Add the environment variables in your project settings
2. **Docker**: Pass them as environment variables or use `.env` file
3. **Other platforms**: Follow their environment variable configuration

**Important**: Make sure to wrap `FIREBASE_PRIVATE_KEY` in quotes and keep the `\n` characters as-is.

### 4. Clean Up (Optional)

You can now safely delete `firebase_config.json` from your project:

```bash
del firebase_config.json
```

The file is already in `.gitignore`, so it won't be committed.

## Testing

Your application should work exactly as before. Test file uploads to ensure everything is working:

1. Start your development server
2. Try uploading an image through the admin panel
3. Verify the file appears in Firebase Storage

## Troubleshooting

If you encounter issues:

1. **Check environment variables are loaded**: Add a console.log in `lib/firebase-admin.ts`
2. **Verify private key format**: Ensure `\n` characters are present in the key
3. **Restart dev server**: Environment variables are loaded at startup

## Reverting (If Needed)

If you need to revert, the old `firebase_config.json` file is still available. Just restore the old code in `lib/firebase-admin.ts` from git history.
