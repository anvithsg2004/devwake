// lib/analytics.js
const COLD_START_THRESHOLD = 1500; // ms

export function calculateStats(pingLogs) {
    if (!pingLogs || pingLogs.length === 0) {
        return {
            averageResponseTime: 0,
            uptimePercentage: "100.00",
            coldStarts: 0,
            averageColdStartTime: 0,
        };
    }

    const totalPings = pingLogs.length;
    let successfulPings = 0;
    let totalResponseTime = 0;
    let coldStartCount = 0;
    let totalColdStartTime = 0;

    pingLogs.forEach(log => {
        if (log.status >= 200 && log.status < 300) {
            successfulPings++;
            totalResponseTime += log.responseTime;

            if (log.responseTime > COLD_START_THRESHOLD) {
                coldStartCount++;
                totalColdStartTime += log.responseTime;
            }
        }
    });

    const averageResponseTime = successfulPings > 0 ? Math.round(totalResponseTime / successfulPings) : 0;
    const uptimePercentage = ((successfulPings / totalPings) * 100).toFixed(2);
    const averageColdStartTime = coldStartCount > 0 ? Math.round(totalColdStartTime / coldStartCount) : 0;

    return {
        averageResponseTime,
        uptimePercentage,
        coldStarts: coldStartCount,
        averageColdStartTime,
    };
}

export function formatDataForChart(pingLogs) {
    if (!pingLogs || pingLogs.length === 0) return [];

    return pingLogs.slice().reverse().map(log => ({
        time: new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        'Response Time': log.responseTime,
    }));
}
