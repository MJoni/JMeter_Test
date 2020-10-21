/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 55.01432664756447, "KoPercent": 44.98567335243553};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.20773638968481375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.14285714285714285, 500, 1500, "Post_Users"], "isController": false}, {"data": [0.0, 500, 1500, "Update_Users"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.18181818181818182, 500, 1500, "Delete_Users"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "Delete_Tasks"], "isController": false}, {"data": [0.0, 500, 1500, "Update_Tasks"], "isController": false}, {"data": [0.015748031496062992, 500, 1500, "Get_Users"], "isController": false}, {"data": [0.10784313725490197, 500, 1500, "Get_Tasks"], "isController": false}, {"data": [0.07142857142857142, 500, 1500, "Post_Tasks"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 349, 157, 44.98567335243553, 27702.544412607454, 0, 122177, 17814.0, 75991.0, 79113.5, 106889.5, 2.4757918632284612, 24.21217561761785, 0.23407988020075904], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Post_Users", 28, 10, 35.714285714285715, 41935.78571428571, 11, 122177, 36586.0, 120703.2, 122061.35, 122177.0, 0.20109452879242734, 0.2385192081184734, 0.04469079022967868], "isController": false}, {"data": ["Update_Users", 28, 28, 100.0, 0.7142857142857142, 0, 20, 0.0, 0.0, 10.999999999999943, 20.0, 0.26343519494204426, 0.3001775688459657, 0.0032433253283531537], "isController": false}, {"data": ["Debug Sampler", 56, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.5268703898840885, 0.17517631929286467, 0.0], "isController": false}, {"data": ["Delete_Users", 11, 3, 27.272727272727273, 38097.27272727273, 14, 82926, 21767.0, 82301.8, 82926.0, 82926.0, 0.08350667294231966, 0.07135579963332979, 0.013804103783611436], "isController": false}, {"data": ["Delete_Tasks", 6, 0, 0.0, 50307.66666666667, 9, 77772, 74024.5, 77772.0, 77772.0, 77772.0, 0.05007553059197623, 0.009340260100651816, 0.011385988970864387], "isController": false}, {"data": ["Update_Tasks", 28, 28, 100.0, 381.39285714285717, 0, 10679, 0.0, 0.0, 5873.44999999997, 10679.0, 0.2634327164617223, 0.30017474468195204, 0.0035373045423326968], "isController": false}, {"data": ["Get_Users", 127, 68, 53.54330708661417, 44734.645669291334, 449, 93211, 45164.0, 78161.2, 79458.2, 89807.31999999999, 0.9009392468999178, 16.779612447593003, 0.08379106323245651], "isController": false}, {"data": ["Get_Tasks", 51, 18, 35.294117647058826, 32443.647058823528, 7, 78695, 29784.0, 76310.40000000001, 77184.6, 78695.0, 0.36314181756039904, 6.491535480201651, 0.047040716831267225], "isController": false}, {"data": ["Post_Tasks", 14, 2, 14.285714285714286, 30460.35714285714, 218, 81055, 25349.5, 80269.5, 81055.0, 81055.0, 0.10144045445323595, 0.07181355833188419, 0.032266215981219024], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 101, 64.3312101910828, 28.939828080229226], "isController": false}, {"data": ["404", 2, 1.2738853503184713, 0.5730659025787965], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/users\\\/update\\\/${user_id}", 27, 17.197452229299362, 7.736389684813753], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/tasks\\\/update\\\/${task_id}", 27, 17.197452229299362, 7.736389684813753], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 349, 157, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 101, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/users\\\/update\\\/${user_id}", 27, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/tasks\\\/update\\\/${task_id}", 27, "404", 2, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Post_Users", 28, 10, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update_Users", 28, 28, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/users\\\/update\\\/${user_id}", 27, "404", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Delete_Users", 11, 3, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Update_Tasks", 28, 28, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 36: http:\\\/\\\/localhost:8085\\\/tasks\\\/update\\\/${task_id}", 27, "404", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Users", 127, 68, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 68, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Tasks", 51, 18, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 18, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Post_Tasks", 14, 2, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 2, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
