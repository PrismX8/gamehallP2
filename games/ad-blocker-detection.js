// Ad Blocker Detection Script for Game Files
// Include this script in your game HTML files to detect and handle ad blockers

(function() {
    'use strict';
    
    // Create a test ad element
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbygoogle';
    testAd.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(testAd);
    
    // Check if ad blocker is active
    function checkAdBlocker() {
        const isBlocked = testAd.offsetHeight === 0 || 
                         testAd.offsetWidth === 0 || 
                         testAd.style.display === 'none' ||
                         window.getComputedStyle(testAd).display === 'none';
        
        // Clean up test element
        testAd.remove();
        
        return isBlocked;
    }
    
    // Wait for page load, then check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(handleAdBlocker, 1000);
        });
    } else {
        setTimeout(handleAdBlocker, 1000);
    }
    
    function handleAdBlocker() {
        if (checkAdBlocker()) {
            // Ad blocker detected - hide all ad elements
            const adSelectors = [
                '.adsbygoogle',
                'ins.adsbygoogle',
                'iframe[src*="adsbygoogle"]',
                'iframe[src*="doubleclick"]',
                'iframe[src*="googlesyndication"]',
                'div[id*="google_ads"]',
                'div[class*="ad-"]',
                'div[class*="ads-"]',
                'div[id*="ad-"]',
                'div[id*="ads-"]'
            ];
            
            adSelectors.forEach(selector => {
                try {
                    document.querySelectorAll(selector).forEach(el => {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                    });
                } catch (e) {
                    // Ignore errors
                }
            });
            
            // Optionally show a notice (uncomment if needed)
            // showAdBlockerNotice();
        }
    }
    
    // Optional: Show ad blocker notice
    function showAdBlockerNotice() {
        // Check if notice already exists
        if (document.getElementById('adBlockerNotice')) {
            return;
        }
        
        const notice = document.createElement('div');
        notice.id = 'adBlockerNotice';
        notice.className = 'game-ad-blocker-notice show';
        notice.innerHTML = `
            <h3><i class="fas fa-shield-alt"></i> Ad Blocker Detected</h3>
            <p>Please consider disabling your ad blocker to support our free gaming platform. Ads help us keep the games free for everyone!</p>
            <button onclick="this.parentElement.remove()">Got it!</button>
        `;
        document.body.appendChild(notice);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notice.parentElement) {
                notice.style.transition = 'opacity 0.5s';
                notice.style.opacity = '0';
                setTimeout(() => notice.remove(), 500);
            }
        }, 10000);
    }
})();

