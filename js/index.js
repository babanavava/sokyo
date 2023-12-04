fetch('./csv/syllabi.csv')
    .then(response => response.text())
    .then(csvData => {
        const msg = 'csvData is exist.';
        console.log(msg)
        const roomData = "A1,A2,A3,A4,B1,B2,B3,B4,B5,B6,B7,B8,B9,B10,C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,E10";
        const timeSlots = ["月1", "月2", "月3", "月4", "月5", "火1", "火2", "火3", "火4", "火5", "水1", "水2", "水3", "水4", "水5", "木1", "木2", "木3", "木4", "木5", "金1", "金2", "金3", "金4", "金5"];
        const csvRows = csvData.split('\n').map(row => {
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        });
        const headers = csvRows[0];
        csvRows.shift();
        const csvObject = csvRows.reduce((acc, row) => {
            if (row[1]) {
                const timeSlots = row[1].split(',');
                timeSlots.forEach(timeSlot => {
                    const convertedTimeSlot = convertTimeSlot(timeSlot);
                    const obj = {
                        '科目名': row[0],
                        '曜日・時限': convertedTimeSlot,
                        '講義室情報': row[2],
                        '適正人数': row[3],
                        '担当教員': row[4],
                        'URL': row[5],
                    };
                    acc.push(obj);
                });
            }
            return acc;
        }, []);

        function convertTimeSlot(timeSlot) {
            const rangeParts = timeSlot.split('〜');
            if (rangeParts.length === 2) {
                const start = parseInt(rangeParts[0].slice(-1));
                const end = parseInt(rangeParts[1]);
                const convertedSlots = [];
                for (let i = start; i <= end; i++) {
                    convertedSlots.push(`${rangeParts[0].slice(0, -1)}${i}`);
                }
                return convertedSlots.join(',');
            }
            return timeSlot;
        }

        function generateTable() {
            const table = document.createElement('table');
            const headerRow = table.insertRow();
            const headerCell = headerRow.insertCell(0);

            for (let i = 0; i < timeSlots.length; i++) {
                const cell = headerRow.insertCell(i + 1);
                cell.textContent = timeSlots[i];
            }

            const rooms = roomData.split(',');

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);

            for (let i = 0; i < rooms.length; i++) {
                const row = table.insertRow();
                const roomCell = row.insertCell(0);
                roomCell.textContent = rooms[i];

                for (let j = 0; j < timeSlots.length; j++) {
                    const cell = row.insertCell(j + 1);
                    const matchingRows = csvObject.filter(row => row['曜日・時限'].includes(timeSlots[j]) && row['講義室情報'] === rooms[i]);
                    if (matchingRows.length > 0) {
                        cell.addEventListener('click', function() {
                            window.open(matchingRows[0]['URL'], '_blank');
                        });
                        cell.style.cursor = 'pointer';
                        cell.style.backgroundColor = 'lightcoral';
                        cell.addEventListener('mouseover', function(event) {
                            cell.style.backgroundColor = 'darkred';
                            const subjectNames = matchingRows.map(row => row['科目名']).join('\n');
                            updateTooltipPosition(event.clientX, event.clientY);
                            tooltip.textContent = subjectNames;
                            tooltip.style.display = 'block';
                        });
                        cell.addEventListener('mouseout', function() {
                            cell.style.backgroundColor = 'lightcoral';
                            tooltip.style.display = 'none';
                        });
                        cell.textContent = matchingRows[0]['科目名'];
                        cell.style.color = 'white';
                    }
                }
            }
            document.body.appendChild(table);
            document.addEventListener('mousemove', function(event) {
                updateTooltipPosition(event.clientX, event.clientY);
            });
            document.addEventListener('scroll', function() {
                updateTooltipPosition(event.clientX, event.clientY);
            });

            function updateTooltipPosition(x, y) {
                tooltip.style.left = `${x + window.pageXOffset + 0}px`;
                tooltip.style.top = `${y + window.pageYOffset + 25}px`;
            }
        }

        generateTable();

        function getLinkForCell(room, timeSlot) {
            const matchingRow = csvObject.find(row => row['曜日・時限'] === timeSlot && row['講義室情報'] === room);
            return matchingRow ? matchingRow['URL'] : '';
        }

        document.addEventListener('DOMContentLoaded', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        });
    })
    .catch(error => console.error('CSVファイルの読み取りエラー:', error));