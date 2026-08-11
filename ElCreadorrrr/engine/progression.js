// engine/progression.js
export function updateShop(player) {
    const subs = Number(player.suscriptores ?? player.subscribers ?? 0);
    if (subs >= 1000) player.shopTier = Math.max(Number(player.shopTier) || 1, 2);
    if (subs >= 10000) player.shopTier = Math.max(Number(player.shopTier) || 1, 3);
    if (subs >= 100000) player.shopTier = Math.max(Number(player.shopTier) || 1, 4);
    if (subs >= 1000000) player.shopTier = Math.max(Number(player.shopTier) || 1, 5);
}
