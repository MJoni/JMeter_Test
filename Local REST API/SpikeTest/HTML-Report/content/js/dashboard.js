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

    var data = {"OkPercent": 86.5546218487395, "KoPercent": 13.445378151260504};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14758403361344538, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.13904494382022473, 500, 1500, "Post_Users"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.16141732283464566, 500, 1500, "Update_Users"], "isController": false}, {"data": [0.1953125, 500, 1500, "Delete_Users"], "isController": false}, {"data": [0.11627906976744186, 500, 1500, "Delete_Tasks"], "isController": false}, {"data": [0.1875, 500, 1500, "Update_Tasks"], "isController": false}, {"data": [0.0, 500, 1500, "Get_Users"], "isController": false}, {"data": [0.12549537648612946, 500, 1500, "Get_Tasks"], "isController": false}, {"data": [0.15517241379310345, 500, 1500, "Post_Tasks"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2856, 384, 13.445378151260504, 32404.297969187664, 0, 122795, 26149.5, 75421.3, 81187.6, 120787.73, 20.768341368703503, 389.99376412325387, 4.0981367871790395], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Post_Users", 356, 118, 33.146067415730336, 43005.44101123597, 5, 122795, 25415.0, 120593.0, 121394.2, 122704.34, 2.6963977338140395, 2.6959983156981853, 0.6755491732814252], "isController": false}, {"data": ["Debug Sampler", 191, 0, 0.0, 0.05235602094240836, 0, 1, 0.0, 0.0, 1.0, 1.0, 3.46052107113092, 1.336602908604196, 0.0], "isController": false}, {"data": ["Update_Users", 127, 13, 10.236220472440944, 27245.92125984252, 8, 83069, 8979.0, 81017.2, 81188.2, 82559.68, 0.9879347496324417, 0.600738896916399, 0.3064809880903299], "isController": false}, {"data": ["Delete_Users", 64, 4, 6.25, 22614.140625, 10, 81251, 9644.5, 79476.5, 81210.75, 81251.0, 0.5218142830353285, 0.17720792668509322, 0.11123268942266142], "isController": false}, {"data": ["Delete_Tasks", 43, 4, 9.30232558139535, 28419.790697674416, 14, 81761, 26133.0, 81209.4, 81258.2, 81761.0, 0.3514048019874802, 0.14560729951538826, 0.07236870331628066], "isController": false}, {"data": ["Update_Tasks", 88, 6, 6.818181818181818, 21644.181818181816, 7, 92146, 4970.0, 79884.3, 81172.4, 92146.0, 0.6932245180907967, 0.3748452799681747, 0.2433270985796775], "isController": false}, {"data": ["Get_Users", 1027, 9, 0.8763388510223953, 35265.8081791626, 1892, 92881, 30434.0, 66609.80000000002, 71698.6, 80887.08000000002, 7.471318720491201, 275.4546568772325, 1.4826153844055319], "isController": false}, {"data": ["Get_Tasks", 757, 211, 27.873183619550858, 35959.84147952444, 5, 110683, 48703.0, 74967.0, 76302.9, 85366.13999999996, 5.683439193957686, 113.00626048752197, 0.8221604271776507], "isController": false}, {"data": ["Post_Tasks", 203, 19, 9.35960591133005, 28388.50738916257, 5, 83139, 26152.0, 79782.6, 81226.8, 83043.08000000002, 1.5395466300613543, 0.9192827622917251, 0.5178431937629402], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 21, 5.46875, 0.7352941176470589], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 363, 94.53125, 12.710084033613445], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2856, 384, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 363, "500", 21, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Post_Users", 356, 118, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 98, "500", 20, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Update_Users", 127, 13, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 13, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Delete_Users", 64, 4, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Delete_Tasks", 43, 4, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update_Tasks", 88, 6, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Users", 1027, 9, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 9, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Tasks", 757, 211, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 210, "500", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Post_Tasks", 203, 19, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 19, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
