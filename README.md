# DTF Studio — Printify API bridge

Server-side bridge between the DTF Studio frontend and Printify.

## Endpoints

- `GET /api/health`
- `GET /api/printify/products?page=1&limit=50`

The products endpoint reads the authenticated Printify **My Products** list for the configured shop and returns frontend-ready JSON.

## Required environment variables

```
PRINTIFY_API_TOKEN=your_printify_token
PRINTIFY_SHOP_ID=11490990
```

Never commit the Printify token to GitHub.

## Deployment

This repository is ready for Vercel serverless deployment.

After deployment, test:

```
GET https://YOUR-DOMAIN.vercel.app/api/health
GET https://YOUR-DOMAIN.vercel.app/api/printify/products
```

The frontend will call the second endpoint instead of calling Printify directly, so the Printify token remains server-side.
