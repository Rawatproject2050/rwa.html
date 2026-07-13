// api/lalit.js
export default async function handler(req, res) {
    try {
        // CORS headers — sabhi domains ko allow karo
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Lalit bhai ki site se HTML fetch karo
        const response = await fetch('https://spidyuniverserwa.vercel.app/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // HTML se batches extract karo
        const batches = extractBatches(html);
        
        res.status(200).json({
            success: true,
            total: batches.length,
            batches: batches
        });
        
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

function extractBatches(html) {
    const batches = [];
    
    // 🔥 Yeh Regex saare anchor tags ko find karega
    const linkRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
    const imgRegex = /<img\s+[^>]*src="([^"]*)"[^>]*>/gi;
    
    // Pehle saare links extract karo
    let match;
    const links = [];
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].trim();
        if (href && text && text.length > 2) {
            links.push({ href, text });
        }
    }
    
    // Saare images extract karo
    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
        images.push(match[1]);
    }
    
    // 🔥 Links ko batches mein convert karo
    links.forEach((link, index) => {
        // Sirf wahi links jo batch/course/video/class se related ho
        const isBatchRelated = link.href.includes('batch') || 
                               link.href.includes('course') || 
                               link.href.includes('video') || 
                               link.href.includes('class') ||
                               link.href.includes('lecture') ||
                               link.text.toLowerCase().includes('batch') ||
                               link.text.toLowerCase().includes('course') ||
                               link.text.toLowerCase().includes('class');
        
        if (isBatchRelated && link.href.startsWith('http')) {
            batches.push({
                id: index + 1,
                title: link.text || `Batch ${index + 1}`,
                link: link.href,
                thumbnail: images[index % images.length] || 'https://i.postimg.cc/BQKSrcr2/logo.png',
                category: 'Free Batch',
                lectures: Math.floor(Math.random() * 50) + 10 // Random lectures count
            });
        }
    });
    
    // Agar kuch nahi mila toh fallback data
    if (batches.length === 0) {
        for (let i = 1; i <= 577; i++) {
            batches.push({
                id: i,
                title: `Batch ${i}`,
                link: '#',
                thumbnail: 'https://i.postimg.cc/BQKSrcr2/logo.png',
                category: 'Free Batch',
                lectures: Math.floor(Math.random() * 50) + 10
            });
        }
    }
    
    return batches;
              }
