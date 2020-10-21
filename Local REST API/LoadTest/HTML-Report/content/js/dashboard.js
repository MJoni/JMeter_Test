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

    var data = {"OkPercent": 79.7479510002644, "KoPercent": 20.252048999735614};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6431215299198025, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8015873015873016, 500, 1500, "Post_Users"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9276841171251109, 500, 1500, "Update_Users"], "isController": false}, {"data": [0.0, 500, 1500, "Delete_Users"], "isController": false}, {"data": [0.0, 500, 1500, "Delete_Tasks"], "isController": false}, {"data": [0.9369449378330373, 500, 1500, "Update_Tasks"], "isController": false}, {"data": [0.13373083475298125, 500, 1500, "Get_Users"], "isController": false}, {"data": [0.7625215889464594, 500, 1500, "Get_Tasks"], "isController": false}, {"data": [0.8837622005323869, 500, 1500, "Post_Tasks"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11347, 2298, 20.252048999735614, 510.79025293028883, 0, 9893, 15.0, 1934.4000000000015, 3216.0, 5350.52, 77.96107099424927, 1737.9901136424146, 17.835565734350418], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Post_Users", 1134, 7, 0.6172839506172839, 468.52733686066983, 2, 5173, 55.0, 1550.5, 2207.75, 3209.950000000002, 7.806261530412755, 3.0893197185546715, 2.6819906784357186], "isController": false}, {"data": ["Debug Sampler", 2252, 0, 0.0, 0.028863232682060466, 0, 29, 0.0, 0.0, 0.0, 1.0, 15.508253393291234, 5.985671156335865, 0.0], "isController": false}, {"data": ["Update_Users", 1127, 1, 0.08873114463176575, 184.125110913931, 3, 4226, 14.0, 569.2, 1206.7999999999993, 2611.8800000000037, 7.758341766313514, 2.9476506082932334, 2.6872729334035506], "isController": false}, {"data": ["Delete_Users", 1125, 1125, 100.0, 180.9973333333334, 4, 5745, 15.0, 431.5999999999998, 1005.0, 3500.34, 7.746600103288001, 1.4617874741779997, 1.7686456360819418], "isController": false}, {"data": ["Delete_Tasks", 1124, 1124, 100.0, 152.76245551601423, 4, 4419, 14.0, 424.5, 895.25, 2657.25, 7.970500638207347, 1.486685177634378, 1.8213839349028504], "isController": false}, {"data": ["Update_Tasks", 1126, 1, 0.08880994671403197, 170.07460035523985, 4, 4954, 13.0, 472.2000000000003, 984.4999999999986, 2970.270000000002, 7.753806320109628, 3.029160106890283, 2.927791118500334], "isController": false}, {"data": ["Get_Users", 1174, 16, 1.362862010221465, 3015.910562180581, 209, 9893, 2863.0, 5295.0, 6209.0, 7334.5, 8.066122970586822, 1060.0707884523556, 1.5927925128996132], "isController": false}, {"data": ["Get_Tasks", 1158, 24, 2.0725388601036268, 544.7461139896376, 3, 5420, 91.5, 1865.2000000000016, 2416.1499999999996, 3504.0600000000054, 7.970869843542426, 658.2107410030872, 1.5626586387227335], "isController": false}, {"data": ["Post_Tasks", 1127, 0, 0.0, 282.8101153504878, 2, 6539, 14.0, 1005.6000000000001, 1767.599999999999, 2894.0400000000036, 7.760799355447364, 3.0088255313599643, 2.8799841358105454], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 50, 2.175805047867711, 0.44064510443288973], "isController": false}, {"data": ["Response was null", 2248, 97.82419495213229, 19.811403895302725], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11347, 2298, "Response was null", 2248, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 50, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Post_Users", 1134, 7, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Update_Users", 1127, 1, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Delete_Users", 1125, 1125, "Response was null", 1124, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Delete_Tasks", 1124, 1124, "Response was null", 1124, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update_Tasks", 1126, 1, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Users", 1174, 16, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 16, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get_Tasks", 1158, 24, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket closed", 24, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
