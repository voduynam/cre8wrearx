const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class XSMNScraper {
    constructor() {
        this.baseUrl = "https://xosodaiphat.com/xsmn-{date}.html";
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        this.results = [];
    }

    // Chuyển đổi Date thành format dd-mm-yyyy
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Chuyển đổi Date thành format dd/mm/yyyy để hiển thị
    displayDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Lấy nội dung trang web
    async getPageContent(url) {
        try {
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.log(`Lỗi khi truy cập ${url}: ${error.message}`);
            return null;
        }
    }

    // Trích xuất giải 8 từ HTML
    extractPrize8(htmlContent, dateStr) {
        const $ = cheerio.load(htmlContent);
        const dailyResults = [];

        // Tìm tất cả các bảng kết quả
        $('table.table.table-bordered.table-striped.table-xsmn.livetn3').each((index, table) => {
            const $table = $(table);
            const daiNames = [];

            // Trích xuất tên đài từ thead
            $table.find('thead tr th').each((i, th) => {
                const text = $(th).text().trim();
                // Giả định tên đài không phải là "Giải" hoặc số
                if (text && text !== 'Giải' && !text.match(/^\d+$/) && !text.includes('G.')) {
                    daiNames.push(text);
                }
            });

            // Tìm hàng Giải 8 trong tbody
            const tbody = $table.find('tbody');
            if (tbody.length > 0) {
                tbody.find('tr').each((i, row) => {
                    const $row = $(row);
                    const firstTdText = $row.find('td').first().text().trim();

                    if (firstTdText.includes('G.8') || firstTdText.includes('Giải 8')) {
                        // Thu thập tất cả các số giải trong hàng này
                        const prizeNumbers = [];
                        $row.find('td.tn_prize').each((j, td) => {
                            const prizeNumber = $(td).text().trim();
                            if (prizeNumber && prizeNumber.match(/^\d+$/)) {
                                prizeNumbers.push(prizeNumber);
                            }
                        });

                        // Ánh xạ tên đài với số giải
                        // Giả định rằng thứ tự của daiNames và prizeNumbers khớp nhau
                        for (let k = 0; k < daiNames.length && k < prizeNumbers.length; k++) {
                            dailyResults.push({
                                'Ngày': dateStr,
                                'Đài': daiNames[k],
                                'Giải 8': prizeNumbers[k]
                            });
                        }
                    }
                });
            }
        });

        return dailyResults;
    }

    // Lấy dữ liệu trong khoảng thời gian
    async scrapeDateRange(startDate, endDate) {
        // Set time to midnight for both dates to ensure proper date comparison
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        const endDateMidnight = new Date(endDate);
        endDateMidnight.setHours(0, 0, 0, 0);
        
        console.log(`Bắt đầu lấy dữ liệu từ ${this.displayDate(startDate)} đến ${this.displayDate(endDate)}`);

        while (currentDate <= endDateMidnight) {
            const dateStr = this.formatDate(currentDate);
            const displayDateStr = this.displayDate(currentDate);
            const url = this.baseUrl.replace('{date}', dateStr);

            console.log(`Đang lấy dữ liệu ngày ${displayDateStr}...`);

            const htmlContent = await this.getPageContent(url);
            if (htmlContent) {
                const dayResults = this.extractPrize8(htmlContent, displayDateStr);
                if (dayResults.length > 0) {
                    this.results.push(...dayResults);
                    console.log(`  → Tìm thấy ${dayResults.length} kết quả giải 8`);
                } else {
                    console.log(`  → Không tìm thấy dữ liệu giải 8`);
                }
            } else {
                console.log(`  → Không thể truy cập dữ liệu`);
            }

            // Nghỉ 1 giây để tránh spam requests
            await this.delay(1000);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Hàm delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Lưu kết quả ra file JSON
    saveToJson(filename = "xsmn_giai8_results.json") {
        if (this.results.length === 0) {
            console.log("Không có dữ liệu để lưu!");
            return;
        }

        // Sắp xếp theo ngày và đài
        const sortedResults = this.results.sort((a, b) => {
            const dateA = new Date(a['Ngày'].split('/').reverse().join('-'));
            const dateB = new Date(b['Ngày'].split('/').reverse().join('-'));
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            return a['Đài'].localeCompare(b['Đài']);
        });

        const jsonData = {
            metadata: {
                totalResults: sortedResults.length,
                createdAt: new Date().toISOString(),
                dateRange: {
                    from: "04/04/2025",
                    to: "04/05/2025"
                }
            },
            results: sortedResults
        };

        fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`Đã lưu ${this.results.length} kết quả vào file ${filename}`);
    }

    // Lưu kết quả ra file CSV
    saveToCsv(filename = "xsmn_giai8_results.csv") {
        if (this.results.length === 0) {
            console.log("Không có dữ liệu để lưu!");
            return;
        }

        // Sắp xếp theo ngày và đài
        const sortedResults = this.results.sort((a, b) => {
            const dateA = new Date(a['Ngày'].split('/').reverse().join('-'));
            const dateB = new Date(b['Ngày'].split('/').reverse().join('-'));
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            return a['Đài'].localeCompare(b['Đài']);
        });

        // Tạo CSV content
        let csvContent = "Ngày,Đài,Giải 8\n";
        sortedResults.forEach(result => {
            csvContent += `"${result['Ngày']}","${result['Đài']}","${result['Giải 8']}"\n`;
        });

        fs.writeFileSync(filename, csvContent, 'utf8');
        console.log(`Đã lưu ${this.results.length} kết quả vào file ${filename}`);
    }

    // Lưu kết quả ra file HTML
    saveToHtml(filename = "xsmn_giai8_results.html") {
        if (this.results.length === 0) {
            console.log("Không có dữ liệu để lưu!");
            return;
        }

        // Sắp xếp theo ngày và đài
        const sortedResults = this.results.sort((a, b) => {
            const dateA = new Date(a['Ngày'].split('/').reverse().join('-'));
            const dateB = new Date(b['Ngày'].split('/').reverse().join('-'));
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            return a['Đài'].localeCompare(b['Đài']);
        });

        let htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kết Quả Giải 8 XSMN</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { text-align: center; margin-bottom: 20px; }
        .summary { margin-bottom: 20px; padding: 10px; background-color: #e7f3ff; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Kết Quả Giải 8 XSMN</h1>
        <p>Từ ngày 04/04/2025 đến 04/05/2025</p>
    </div>
    
    <div class="summary">
        <h3>Tóm tắt:</h3>
        <p>Tổng số kết quả: <strong>${sortedResults.length}</strong></p>
        <p>Ngày tạo: <strong>${new Date().toLocaleString('vi-VN')}</strong></p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Ngày</th>
                <th>Đài</th>
                <th>Giải 8</th>
            </tr>
        </thead>
        <tbody>
`;

        sortedResults.forEach((result, index) => {
            htmlContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${result['Ngày']}</td>
                <td>${result['Đài']}</td>
                <td><strong>${result['Giải 8']}</strong></td>
            </tr>`;
        });

        htmlContent += `
        </tbody>
    </table>
</body>
</html>
`;

        fs.writeFileSync(filename, htmlContent, 'utf8');
        console.log(`Đã lưu ${this.results.length} kết quả vào file ${filename}`);
    }

    // In tóm tắt kết quả
    printSummary() {
        if (this.results.length === 0) {
            console.log("Không có dữ liệu!");
            return;
        }

        console.log("\n" + "=".repeat(50));
        console.log("TÓM TẮT KẾT QUẢ");
        console.log("=".repeat(50));
        console.log(`Tổng số kết quả giải 8: ${this.results.length}`);

        // Đếm số ngày có dữ liệu
        const uniqueDates = [...new Set(this.results.map(r => r['Ngày']))];
        console.log(`Số ngày có dữ liệu: ${uniqueDates.length}`);

        // Đếm số đài khác nhau
        const uniqueDai = [...new Set(this.results.map(r => r['Đài']))];
        console.log(`Số đài khác nhau: ${uniqueDai.length}`);

        // Thống kê theo đài
        const daiStats = {};
        this.results.forEach(result => {
            const dai = result['Đài'];
            daiStats[dai] = (daiStats[dai] || 0) + 1;
        });

        console.log("\nThống kê theo đài:");
        Object.entries(daiStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([dai, count]) => {
                console.log(`  ${dai}: ${count} lần`);
            });
    }
}

// Hàm main
async function main() {
    console.log("🚀 Bắt đầu chương trình lấy giải 8 XSMN...\n");
    
    // Khởi tạo scraper
    const scraper = new XSMNScraper();
    
    // Định nghĩa khoảng thời gian
    const startDate = new Date(2025, 3, 4); // Tháng 5 (index 4)
    const endDate = new Date(2025, 3, 5);   // Tháng 6 (index 5)
    
    try {
        // Lấy dữ liệu
        await scraper.scrapeDateRange(startDate, endDate);
        
        // In tóm tắt
        scraper.printSummary();
        
        // Lưu kết quả
        scraper.saveToJson();
        scraper.saveToCsv();
        scraper.saveToHtml();
        
        console.log("\n✅ Hoàn thành!");
        console.log("📁 Các file đã được tạo:");
        console.log("   - xsmn_giai8_results.json");
        console.log("   - xsmn_giai8_results.csv");
        console.log("   - xsmn_giai8_results.html");
        
    } catch (error) {
        console.error("❌ Lỗi:", error.message);
    }
}

// Chạy chương trình
if (require.main === module) {
    main().catch(console.error);
}

module.exports = XSMNScraper; 