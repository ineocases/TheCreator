// Banco de sponsors. Las ofertas reales se generan automáticamente desde gameState.
// Los umbrales son deliberadamente escalonados para que una marca grande no aparezca
// cuando el canal todavía es pequeño.
export default [
    { id: "redragon", name: "Redragon", minSubs: 5000, minFama: 3, payMin: 400, payMax: 1000, duration: 2 },
    { id: "logitech", name: "Logitech G", minSubs: 15000, minFama: 8, payMin: 900, payMax: 2200, duration: 2 },
    { id: "redbull", name: "Red Bull", minSubs: 75000, minFama: 15, payMin: 2500, payMax: 6000, duration: 2 },
    { id: "adidas", name: "Adidas", minSubs: 300000, minFama: 30, payMin: 8000, payMax: 18000, duration: 2 },
    { id: "nike", name: "Nike", minSubs: 750000, minFama: 40, payMin: 12000, payMax: 28000, duration: 2 },
    { id: "cocacola", name: "Coca-Cola", minSubs: 1500000, minFama: 50, payMin: 18000, payMax: 40000, duration: 2 },
    { id: "apple", name: "Apple", minSubs: 3000000, minFama: 65, payMin: 50000, payMax: 100000, duration: 2 }
];
