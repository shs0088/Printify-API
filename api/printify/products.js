function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    description: product.description ?? '',
    tags: product.tags ?? [],
    blueprintId: product.blueprint_id,
    printProviderId: product.print_provider_id,
    variants: (product.variants ?? []).map((variant) => ({
      id: variant.id,
      title: variant.title,
      options: variant.options ?? {},
      price: variant.price,
      cost: variant.cost,
      sku: variant.sku ?? null,
      grams: variant.grams ?? null,
      enabled: variant.is_enabled !== false
    })),
    images: (product.images ?? []).map((image) => ({
      src: image.src,
      variantIds: image.variant_ids ?? [],
      position: image.position ?? null,
      isDefault: image.is_default ?? false,
      isSelectedForPublishing: image.is_selected_for_publishing ?? false
    })),
    printAreas: (product.print_areas ?? []).map((area) => ({
      variantIds: area.variant_ids ?? [],
      placeholders: (area.placeholders ?? []).map((placeholder) => ({
        position: placeholder.position,
        images: placeholder.images ?? []
      }))
    })),
    createdAt: product.created_at ?? null,
    updatedAt: product.updated_at ?? null,
    visible: product.visible ?? null,
    isLocked: product.is_locked ?? null
  };
}

module.exports = async function handler(req, res) {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!token) {
    return res.status(500).json({
      ok: false,
      error: 'PRINTIFY_API_TOKEN is not configured on the server'
    });
  }

  if (!shopId) {
    return res.status(500).json({
      ok: false,
      error: 'PRINTIFY_SHOP_ID is not configured on the server'
    });
  }

  const page = clampInt(req.query?.page, 1, 1, 100000);
  const limit = clampInt(req.query?.limit, 50, 1, 50);

  const url = new URL(
    `https://api.printify.com/v1/shops/${encodeURIComponent(shopId)}/products.json`
  );
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent': 'DTF-Studio-Printify-Bridge/1.0'
      }
    });

    const text = await upstream.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        ok: false,
        error: 'Printify API request failed',
        status: upstream.status,
        details: data
      });
    }

    const rawProducts = Array.isArray(data.data) ? data.data : [];
    const products = rawProducts.map(normalizeProduct);

    return res.status(200).json({
      ok: true,
      source: 'printify-my-products',
      shopId: String(shopId),
      page: data.current_page ?? page,
      perPage: data.per_page ?? limit,
      total: data.total ?? products.length,
      lastPage: data.last_page ?? null,
      nextPageUrl: data.next_page_url ?? null,
      prevPageUrl: data.prev_page_url ?? null,
      products
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Failed to reach Printify',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
